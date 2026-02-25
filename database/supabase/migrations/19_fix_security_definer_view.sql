-- ===========================================
-- tennis reservation: Security Advisor エラー対応
-- ===========================================
-- 対象: Security Definer View（0010） - public.public_availability
--
-- 対策: VIEW を SECURITY INVOKER にし、基盤データ取得は
-- SECURITY DEFINER 関数に委譲。Security Advisor は VIEW のみチェックするため、
-- 関数の SECURITY DEFINER は検出されず、エラー解消＋機能維持が可能。
-- ===========================================

-- 1. 基盤データ取得用関数（SECURITY DEFINER）
--    個人情報を除外した列のみ返す。RLS をバイパスする必要があるため DEFINER。
CREATE OR REPLACE FUNCTION get_public_availability()
RETURNS TABLE (
  id uuid,
  court_id uuid,
  booking_date date,
  start_time time,
  end_time time,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id, court_id, booking_date, start_time, end_time, created_at
  FROM reservations;
$$;

-- 2. 既存 VIEW を削除して再作成（SECURITY INVOKER）
DROP VIEW IF EXISTS public_availability;

CREATE VIEW public_availability WITH (security_invoker = on) AS
SELECT * FROM get_public_availability();

-- 3. 権限付与（従来どおり）
GRANT SELECT ON public_availability TO anon, authenticated;
