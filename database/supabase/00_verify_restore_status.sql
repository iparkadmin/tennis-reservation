-- ===========================================
-- Supabase 復元状況の検証用 SQL
-- ===========================================
-- Supabase Dashboard > SQL Editor で実行してください
-- 結果を確認し、不足があれば SUPABASE_RESTORE_CHECKLIST.md に従って復元する

-- ===========================================
-- 1. テーブル存在確認（期待: audit_logs, courts, profiles, reservations）
-- ===========================================
SELECT '1. TABLES' AS check_section, table_name AS result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'courts', 'reservations', 'audit_logs')
ORDER BY table_name;

-- ===========================================
-- 2. profiles カラム確認（phone が無いことが正）
-- ===========================================
SELECT '2. PROFILES_COLUMNS' AS check_section, column_name AS result
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ===========================================
-- 3. RLS ポリシー一覧
-- ===========================================
SELECT '3. POLICIES' AS check_section,
  tablename || ': ' || policyname || ' (' || cmd || ')' AS result
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'reservations', 'courts', 'audit_logs')
ORDER BY tablename, policyname;

-- ===========================================
-- 4. トリガー確認
-- ===========================================
SELECT '4. TRIGGERS' AS check_section,
  tgname || ' on ' || tgrelid::regclass::text AS result
FROM pg_trigger
WHERE tgrelid IN (
    'public.profiles'::regclass,
    'auth.users'::regclass,
    'public.reservations'::regclass
  )
  AND NOT tgisinternal
ORDER BY tgrelid::regclass::text, tgname;

-- ===========================================
-- 5. 関数確認
-- ===========================================
SELECT '5. FUNCTIONS' AS check_section, routine_name AS result
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'check_daily_limit', 'log_reservation_changes', 'create_missing_profiles')
ORDER BY routine_name;

-- ===========================================
-- 6. VIEW 確認
-- ===========================================
SELECT '6. VIEWS' AS check_section, table_name AS result
FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'public_availability';

-- ===========================================
-- 7. auth.users に profile が無いユーザー数（0 が正常）
-- ===========================================
SELECT '7. ORPHAN_USERS' AS check_section,
  (SELECT COUNT(*)::text FROM auth.users u
   LEFT JOIN public.profiles p ON u.id = p.id
   WHERE p.id IS NULL) AS result;
