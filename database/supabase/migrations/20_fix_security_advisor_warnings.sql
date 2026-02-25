-- ===========================================
-- tennis reservation: Security Advisor 警告対応
-- ===========================================
-- 対象:
-- 1. Function Search Path Mutable（4関数）
-- 2. RLS Policy Always True（audit_logs）
-- 3. Leaked Password Protection → ダッシュボードで手動設定（本ファイル末尾に手順）
-- ===========================================

-- ===========================================
-- 1. Function Search Path Mutable の修正
-- ===========================================
-- 各関数に SET search_path = public を追加
-- （SECURITY DEFINER 関数の search_path 操作攻撃を防止）

-- handle_new_user（18 で最新版）
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

-- create_missing_profiles（18 で最新版）
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

-- check_daily_limit（05 で court_id 対応版）
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
$$ LANGUAGE plpgsql SET search_path = public;

-- log_reservation_changes（17 で作成）
CREATE OR REPLACE FUNCTION log_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'create', 'reservations', NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;

  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'update', 'reservations', NEW.id,
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;

  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'delete', 'reservations', OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===========================================
-- 2. RLS Policy Always True の修正（audit_logs）
-- ===========================================
-- USING (true) / WITH CHECK (true) のポリシーを削除
-- RLS 有効・ポリシーなし = 誰も API から読めない（セキュアなデフォルト）
-- トリガー（log_reservation_changes）は SECURITY DEFINER のため INSERT 可能

DROP POLICY IF EXISTS "Allow select audit_logs for admins" ON audit_logs;
DROP POLICY IF EXISTS "Allow insert into audit_logs" ON audit_logs;

-- ===========================================
-- 3. Leaked Password Protection（手動設定）
-- ===========================================
-- ダッシュボードで有効化: Authentication > Providers > Email > Security
-- ※ Pro プラン以上で利用可能。FREE プランでは表示されない場合あり。
-- 有効化後、漏洩済みパスワードでの登録が拒否される。
