-- ===========================================
-- テニスコート予約システム - 新規プロジェクト用 フルセットアップ
-- ===========================================
-- テーブルが1つもない状態の Supabase で、このファイルを1回だけ実行してください。
-- Supabase Dashboard > SQL Editor > New Query に貼り付けて Run
--
-- 【別アカウントへの完全コピー手順】
--  1. 新しい Supabase アカウントでプロジェクトを作成
--  2. Dashboard > SQL Editor > New Query に本ファイルを貼り付け、Run
--  3. 実行後、管理者を1名付与:
--     UPDATE profiles SET role = 'admin' WHERE email = '管理者メールアドレス';
--  4. アプリ側の .env を新プロジェクトの Supabase URL / anon key に更新
--  5. Auth > Providers / Email Templates などは Dashboard で別途設定
--
-- 【本スクリプトで作成されるもの】
--  テーブル: courts, profiles, reservations, utilizers, reservation_utilizers,
--           admin_notes, audit_logs
--  VIEW: public_availability
--  RLS・ポリシー・トリガー・関数（管理者機能・ブロック・2時間枠・予約利用者紐付け含む）
--
-- 【本スクリプトでは作成されないもの】
--  - ユーザーデータ・予約データ（別アカウントは空のDBから開始）
--  - Auth のメールテンプレート・プロバイダー設定
--  - Storage バケット（本アプリは未使用）
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
-- 2. profiles テーブル（ユーザー情報）
-- ===========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  full_name_kana TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  is_blocked BOOLEAN DEFAULT false,
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
-- 4. utilizers テーブル（利用者情報）
-- ===========================================
CREATE TABLE IF NOT EXISTS utilizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE utilizers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own utilizers" ON utilizers;
CREATE POLICY "Users can view own utilizers" ON utilizers FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own utilizers" ON utilizers;
CREATE POLICY "Users can insert own utilizers" ON utilizers FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own utilizers" ON utilizers;
CREATE POLICY "Users can update own utilizers" ON utilizers FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own utilizers" ON utilizers;
CREATE POLICY "Users can delete own utilizers" ON utilizers FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_utilizers_user_id ON utilizers(user_id);

CREATE OR REPLACE FUNCTION update_utilizers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS utilizers_updated_at ON utilizers;
CREATE TRIGGER utilizers_updated_at
  BEFORE UPDATE ON utilizers
  FOR EACH ROW EXECUTE FUNCTION update_utilizers_updated_at();

-- ===========================================
-- 5. reservation_utilizers テーブル（予約と利用者の紐付け）
-- ===========================================
CREATE TABLE IF NOT EXISTS reservation_utilizers (
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  utilizer_id UUID NOT NULL REFERENCES utilizers(id) ON DELETE CASCADE,
  PRIMARY KEY (reservation_id, utilizer_id)
);

CREATE INDEX IF NOT EXISTS idx_reservation_utilizers_reservation ON reservation_utilizers(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_utilizers_utilizer ON reservation_utilizers(utilizer_id);

ALTER TABLE reservation_utilizers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reservation utilizers" ON reservation_utilizers;
CREATE POLICY "Users can view own reservation utilizers" ON reservation_utilizers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_utilizers.reservation_id AND r.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Users can insert own reservation utilizers" ON reservation_utilizers;
CREATE POLICY "Users can insert own reservation utilizers" ON reservation_utilizers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_utilizers.reservation_id AND r.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM utilizers u WHERE u.id = reservation_utilizers.utilizer_id AND u.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Users can delete own reservation utilizers" ON reservation_utilizers;
CREATE POLICY "Users can delete own reservation utilizers" ON reservation_utilizers
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_utilizers.reservation_id AND r.user_id = auth.uid())
  );

-- ===========================================
-- 6. admin_notes テーブル
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at DESC);

-- ===========================================
-- 7. audit_logs テーブル
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

DROP POLICY IF EXISTS "Allow insert into audit_logs" ON audit_logs;
CREATE POLICY "Allow insert into audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view audit_logs" ON audit_logs;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ===========================================
-- 8. ヘルパー関数（管理者・ブロック判定）
-- ===========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_blocked_user(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_blocked FROM profiles WHERE id = target_user_id), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_blocked_user(UUID) TO authenticated;

-- ===========================================
-- 9. 管理者用 RLS ポリシー
-- ===========================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all reservations" ON reservations;
CREATE POLICY "Admins can view all reservations" ON reservations FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can update any reservation" ON reservations;
CREATE POLICY "Admins can update any reservation" ON reservations FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete any reservation" ON reservations;
CREATE POLICY "Admins can delete any reservation" ON reservations FOR DELETE USING (public.is_admin());
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON reservations;
CREATE POLICY "Authenticated users can create reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id AND NOT public.is_blocked_user(auth.uid()));
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id AND NOT public.is_blocked_user(auth.uid()));
DROP POLICY IF EXISTS "Users can delete own reservations" ON reservations;
CREATE POLICY "Users can delete own reservations" ON reservations
  FOR DELETE USING (auth.uid() = user_id AND NOT public.is_blocked_user(auth.uid()));
DROP POLICY IF EXISTS "Admins can insert reservations for any user" ON reservations;
CREATE POLICY "Admins can insert reservations for any user" ON reservations FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update courts" ON courts;
CREATE POLICY "Admins can update courts" ON courts FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all utilizers" ON utilizers;
CREATE POLICY "Admins can view all utilizers" ON utilizers FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert utilizers for any user" ON utilizers;
CREATE POLICY "Admins can insert utilizers for any user" ON utilizers FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update any utilizer" ON utilizers;
CREATE POLICY "Admins can update any utilizer" ON utilizers FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete any utilizer" ON utilizers;
CREATE POLICY "Admins can delete any utilizer" ON utilizers FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can view audit_logs" ON audit_logs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all admin_notes" ON admin_notes;
CREATE POLICY "Admins can view all admin_notes" ON admin_notes FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert admin_notes" ON admin_notes;
CREATE POLICY "Admins can insert admin_notes" ON admin_notes FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all reservation utilizers" ON reservation_utilizers;
CREATE POLICY "Admins can view all reservation utilizers" ON reservation_utilizers FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert any reservation utilizer" ON reservation_utilizers;
CREATE POLICY "Admins can insert any reservation utilizer" ON reservation_utilizers FOR INSERT WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete any reservation utilizer" ON reservation_utilizers;
CREATE POLICY "Admins can delete any reservation utilizer" ON reservation_utilizers FOR DELETE USING (public.is_admin());

-- ===========================================
-- 10. 新規ユーザー登録トリガー
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- auth.users トリガー（失敗時も他テーブルは作成済みのまま）
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'auth.users トリガー作成をスキップしました: % (他テーブルは作成済み)', SQLERRM;
END $$;

-- ===========================================
-- 11. 予約制限（1日4時間＝2枠×2時間、コートごと）
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

  IF (total_hours + (NEW.end_time - NEW.start_time)) > INTERVAL '4 hours' THEN
    RAISE EXCEPTION '同一コートでの1日の予約時間は最大4時間（2枠）までです。現在の予約時間: %', total_hours;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS check_daily_limit_trigger ON reservations;
CREATE TRIGGER check_daily_limit_trigger
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION check_daily_limit();

-- ===========================================
-- 12. プロフィール修復関数
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===========================================
-- 13. 公開用 VIEW（空き状況・個人情報なし）
-- ===========================================
CREATE OR REPLACE FUNCTION get_public_availability()
RETURNS TABLE (id uuid, court_id uuid, booking_date date, start_time time, end_time time, created_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT id, court_id, booking_date, start_time, end_time, created_at FROM reservations;
$$;

DROP VIEW IF EXISTS public_availability;
CREATE VIEW public_availability WITH (security_invoker = on) AS
SELECT * FROM get_public_availability();

GRANT SELECT ON public_availability TO anon, authenticated;

-- ===========================================
-- 14. 監査ログトリガー（reservations, utilizers）
-- ===========================================
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_reservation_changes ON reservations;
CREATE TRIGGER audit_reservation_changes
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION log_reservation_changes();

CREATE OR REPLACE FUNCTION log_utilizer_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'create', 'utilizers', NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'update', 'utilizers', NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'delete', 'utilizers', OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_utilizer_changes ON utilizers;
CREATE TRIGGER audit_utilizer_changes
  AFTER INSERT OR UPDATE OR DELETE ON utilizers
  FOR EACH ROW EXECUTE FUNCTION log_utilizer_changes();

-- ===========================================
-- 15. 作成確認（7テーブル + 1VIEW が表示されれば成功）
-- ===========================================
DO $$
DECLARE
  tbl_count INTEGER;
  vw_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tbl_count FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name IN ('courts','profiles','reservations','utilizers','reservation_utilizers','admin_notes','audit_logs');
  SELECT COUNT(*) INTO vw_count FROM information_schema.views
  WHERE table_schema = 'public' AND table_name = 'public_availability';
  IF tbl_count < 7 THEN
    RAISE WARNING 'テーブル不足: % / 7 のみ作成されています', tbl_count;
  ELSIF vw_count < 1 THEN
    RAISE WARNING 'VIEW が作成されていません';
  ELSE
    RAISE NOTICE '成功: 7テーブル + public_availability VIEW が作成されました';
  END IF;
END $$;

-- ===========================================
-- 完了
-- ===========================================
-- Table Editor で profiles, courts, reservations, utilizers, reservation_utilizers,
-- admin_notes, audit_logs が作成されていることを確認してください。
--
-- 管理者の付与: UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
