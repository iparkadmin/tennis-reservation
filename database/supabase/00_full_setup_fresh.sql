-- ===========================================
-- テニスコート予約システム - 新規プロジェクト用 フルセットアップ
-- ===========================================
-- テーブルが1つもない状態の Supabase で、このファイルを1回だけ実行してください。
-- Supabase Dashboard > SQL Editor > New Query に貼り付けて Run
--
-- 含まれる内容: profiles（電話番号なし）, courts, reservations, audit_logs,
-- RLS・ポリシー・トリガー・VIEW・関数
-- ===========================================

-- ===========================================
-- 1. courts テーブル（コート情報）
-- ===========================================
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view courts" ON courts;
CREATE POLICY "Anyone can view courts" ON courts
  FOR SELECT USING (true);

INSERT INTO courts (name, display_name, is_active)
VALUES 
  ('court_a', 'コートA', true),
  ('court_b', 'コートB', true)
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 2. profiles テーブル（ユーザー情報・電話番号なし）
-- ===========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  full_name_kana TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- 3. reservations テーブル（予約データ）
-- ===========================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  contact_notes TEXT,
  reservation_number TEXT UNIQUE DEFAULT substring(md5(random()::text || gen_random_uuid()::text || clock_timestamp()::text) from 1 for 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_business_hours CHECK (start_time >= '09:00' AND end_time <= '17:00'),
  CONSTRAINT valid_time_order CHECK (start_time < end_time),
  CONSTRAINT max_duration CHECK ((end_time - start_time) <= INTERVAL '2 hours'),
  CONSTRAINT unique_booking UNIQUE (court_id, booking_date, start_time)
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reservations" ON reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON reservations;
CREATE POLICY "Authenticated users can create reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own reservations" ON reservations;
CREATE POLICY "Users can delete own reservations" ON reservations
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reservations_booking_date ON reservations(booking_date);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_court_id ON reservations(court_id);
CREATE INDEX IF NOT EXISTS idx_reservations_court_date ON reservations(court_id, booking_date);

-- ===========================================
-- 4. 新規ユーザー登録トリガー（phone なし）
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.profiles (id, full_name, full_name_kana, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name_kana', ''),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- 5. 1日2時間制限（コートごと）
-- ===========================================
CREATE OR REPLACE FUNCTION check_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_hours INTERVAL;
BEGIN
  SELECT COALESCE(SUM(end_time - start_time), INTERVAL '0 hours')
  INTO total_hours
  FROM reservations
  WHERE user_id = NEW.user_id
    AND court_id = NEW.court_id
    AND booking_date = NEW.booking_date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  IF (total_hours + (NEW.end_time - NEW.start_time)) > INTERVAL '2 hours' THEN
    RAISE EXCEPTION '同一コートでの1日の予約時間は最大2時間までです。現在の予約時間: %', total_hours;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_daily_limit_trigger ON reservations;
CREATE TRIGGER check_daily_limit_trigger
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION check_daily_limit();

-- ===========================================
-- 6. プロフィール修復関数（phone なし）
-- ===========================================
DROP FUNCTION IF EXISTS public.create_missing_profiles();
CREATE FUNCTION public.create_missing_profiles()
RETURNS TABLE(created_count INTEGER, error_message TEXT) AS $$
DECLARE
  v_count INTEGER := 0;
  v_error TEXT;
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, full_name_kana, email)
    SELECT
      u.id,
      COALESCE(u.raw_user_meta_data->>'full_name', ''),
      COALESCE(u.raw_user_meta_data->>'full_name_kana', ''),
      COALESCE(u.email, '')
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
    ON CONFLICT (id) DO NOTHING;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN QUERY SELECT v_count, NULL::TEXT;
  EXCEPTION
    WHEN OTHERS THEN
      v_error := SQLERRM;
      RETURN QUERY SELECT 0, v_error;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 7. 公開用 VIEW（空き状況・個人情報なし）
-- ===========================================
CREATE OR REPLACE VIEW public_availability AS
SELECT id, court_id, booking_date, start_time, end_time, created_at
FROM reservations;

GRANT SELECT ON public_availability TO anon, authenticated;

-- ===========================================
-- 8. 監査ログ
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- トリガーからの INSERT/SELECT を許可（19_admin_queries の推奨）
DROP POLICY IF EXISTS "Allow insert into audit_logs" ON audit_logs;
CREATE POLICY "Allow insert into audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow select audit_logs for admins" ON audit_logs;
CREATE POLICY "Allow select audit_logs for admins" ON audit_logs FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

CREATE OR REPLACE FUNCTION log_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'create', 'reservations', NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'update', 'reservations', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'delete', 'reservations', OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_reservation_changes ON reservations;
CREATE TRIGGER audit_reservation_changes
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION log_reservation_changes();

-- ===========================================
-- 完了
-- ===========================================
-- Table Editor で profiles, courts, reservations, audit_logs が作成されていることを確認してください。
