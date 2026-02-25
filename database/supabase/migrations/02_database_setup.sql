-- ===========================================
-- テニスコート予約システム - データベースセットアップ
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- Dashboard > SQL Editor > New Query

-- ===========================================
-- 1. profiles テーブル（ユーザー情報）
-- ===========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  full_name_kana TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- profilesテーブルのRLS（Row Level Security）を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 新規ユーザー登録時に自動でprofileを作成するトリガー（改善版）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 既にprofileが存在する場合はスキップ
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- profileを作成（電話番号は廃止）
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
    -- エラーをログに記録（Supabaseのログで確認可能）
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを作成（既存の場合は削除してから作成）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- 2. reservations テーブル（予約データ）
-- ===========================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  contact_notes TEXT,
  reservation_number TEXT UNIQUE DEFAULT substring(md5(random()::text || clock_timestamp()::text) from 1 for 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 制約: 営業時間内（9:00-17:00）の予約のみ
  CONSTRAINT valid_business_hours 
    CHECK (start_time >= '09:00' AND end_time <= '17:00'),
  
  -- 制約: 開始時間 < 終了時間
  CONSTRAINT valid_time_order 
    CHECK (start_time < end_time),
  
  -- 制約: 1予約あたり最大2時間
  CONSTRAINT max_duration 
    CHECK ((end_time - start_time) <= INTERVAL '2 hours'),
  
  -- 制約: 同一日時の重複予約を防止
  CONSTRAINT unique_booking 
    UNIQUE (booking_date, start_time)
);

-- reservationsテーブルのRLSを有効化
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが予約一覧を閲覧可能（空き状況確認のため）
CREATE POLICY "Anyone can view reservations" ON reservations
  FOR SELECT USING (true);

-- 認証済みユーザーのみ予約作成可能
CREATE POLICY "Authenticated users can create reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分の予約のみ削除可能（キャンセル）
CREATE POLICY "Users can delete own reservations" ON reservations
  FOR DELETE USING (auth.uid() = user_id);

-- profilesテーブルにINSERTポリシーを追加（クライアント側からの作成を許可）
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- 3. インデックス（パフォーマンス向上）
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_reservations_booking_date 
  ON reservations(booking_date);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id 
  ON reservations(user_id);

-- ===========================================
-- 4. 1日最大2時間制限のためのチェック関数
-- ===========================================
CREATE OR REPLACE FUNCTION check_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_hours INTERVAL;
BEGIN
  -- 同じ日の既存予約時間を集計
  SELECT COALESCE(SUM(end_time - start_time), INTERVAL '0 hours')
  INTO total_hours
  FROM reservations
  WHERE user_id = NEW.user_id
    AND booking_date = NEW.booking_date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- 新規予約を加えて2時間を超える場合はエラー
  IF (total_hours + (NEW.end_time - NEW.start_time)) > INTERVAL '2 hours' THEN
    RAISE EXCEPTION '1日の予約時間は最大2時間までです。現在の予約時間: %', total_hours;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 予約作成時にチェックするトリガー
DROP TRIGGER IF EXISTS check_daily_limit_trigger ON reservations;
CREATE TRIGGER check_daily_limit_trigger
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION check_daily_limit();

-- ===========================================
-- 5. 既存ユーザーのプロフィール修復関数（オプション）
-- ===========================================
-- 既存のユーザーでprofileが作成されていない場合の修復関数
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
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
-- 完了メッセージ
-- ===========================================
-- 実行後、以下を確認してください:
-- 1. Table Editor で profiles, reservations テーブルが作成されていること
-- 2. Authentication > Policies で RLS ポリシーが設定されていること
-- 3. 既存ユーザーのプロフィール修復が必要な場合:
--    SELECT * FROM public.create_missing_profiles();
