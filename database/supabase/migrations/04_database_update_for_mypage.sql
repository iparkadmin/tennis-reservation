-- ===========================================
-- マイページ機能対応のためのデータベース更新SQL
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- 既存のテーブルにカラムを追加します

-- ===========================================
-- 1. profilesテーブルにカラムを追加
-- ===========================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name_kana TEXT;

-- ===========================================
-- 2. reservationsテーブルにカラムを追加
-- ===========================================
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS contact_notes TEXT,
ADD COLUMN IF NOT EXISTS reservation_number TEXT UNIQUE;

-- 既存の予約に予約番号を生成（既存データ用）
UPDATE reservations 
SET reservation_number = substring(md5(random()::text || id::text || clock_timestamp()::text) from 1 for 10)
WHERE reservation_number IS NULL;

-- 予約番号のデフォルト値を設定
ALTER TABLE reservations 
ALTER COLUMN reservation_number SET DEFAULT substring(md5(random()::text || gen_random_uuid()::text || clock_timestamp()::text) from 1 for 10);

-- ===========================================
-- 3. トリガー関数を更新（full_name_kanaを追加、電話番号は廃止）
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 既にprofileが存在する場合はスキップ
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- profileを作成
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

-- ===========================================
-- 4. 修復関数を更新
-- ===========================================
-- 既存の関数を削除（戻り値の型が異なる場合があるため）
DROP FUNCTION IF EXISTS public.create_missing_profiles();

-- 関数を再作成
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
-- 完了メッセージ
-- ===========================================
-- 実行後、以下を確認してください:
-- 1. Table Editor で profiles, reservations テーブルのカラムが追加されていること
-- 2. 既存の予約に予約番号が生成されていること
