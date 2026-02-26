-- ===========================================
-- マイグレーション 23〜28 の検証用 SQL
-- ===========================================
-- Supabase Dashboard > SQL Editor で実行し、結果を確認してください
-- 想定通りなら各セクションに期待する行が表示されます
-- ===========================================

-- ===========================================
-- 1. テーブル存在（23〜28 で追加されたもの）
-- ===========================================
SELECT '1. TABLES' AS section, table_name AS result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'courts', 'reservations', 'audit_logs', 'admin_notes', 'utilizers')
ORDER BY table_name;

-- ===========================================
-- 2. profiles カラム（23: role, 27: is_blocked）
-- ===========================================
SELECT '2. PROFILES_COLUMNS' AS section, column_name AS result
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ===========================================
-- 3. 関数（23: is_admin, 27: is_blocked_user, 28: check_daily_limit は 4時間）
-- ===========================================
SELECT '3. FUNCTIONS' AS section, routine_name AS result
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'is_blocked_user', 'check_daily_limit', 'handle_new_user')
ORDER BY routine_name;

-- ===========================================
-- 4. check_daily_limit の定義確認（4時間制限であること）
-- ===========================================
SELECT '4. CHECK_DAILY_LIMIT' AS section,
  CASE WHEN prosrc LIKE '%4 hours%' THEN 'OK: 4時間制限' ELSE 'NG: 4時間の記述なし' END AS result
FROM pg_proc WHERE proname = 'check_daily_limit';

-- ===========================================
-- 5. 主要 RLS ポリシー（23〜27 で追加）
-- ===========================================
SELECT '5. POLICIES' AS section,
  tablename || ': ' || policyname AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND (
    policyname LIKE 'Admins%'
    OR policyname = 'Authenticated users can create reservations'
    OR policyname = 'Users can update own reservations'
    OR policyname = 'Users can delete own reservations'
  )
ORDER BY tablename, policyname;

-- ===========================================
-- 6. admin_notes テーブル構造（24）
-- ===========================================
SELECT '6. ADMIN_NOTES' AS section, column_name AS result
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'admin_notes'
ORDER BY ordinal_position;

-- ===========================================
-- 7. utilizers テーブル存在と RLS（21, 26）
-- ===========================================
SELECT '7. UTILIZERS' AS section,
  (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema='public' AND table_name='utilizers') || ' table, ' ||
  (SELECT COUNT(*)::text FROM pg_policies WHERE schemaname='public' AND tablename='utilizers') || ' policies' AS result;
