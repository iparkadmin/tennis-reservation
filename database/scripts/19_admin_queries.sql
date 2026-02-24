-- ===========================================
-- 管理者向けクエリ（Supabase SQL Editor で実行）
-- ===========================================
-- 実行権限: プロジェクトオーナー・管理者（SQL Editor は RLS をバイパス）
-- 個人情報を含むため、取り扱いに注意すること。
-- ===========================================

-- ===========================================
-- 0. 監査ログにデータが入らない場合（17 実行済みのときに追記用）
-- ===========================================
-- 17 で audit_logs の RLS を有効にしたが INSERT/SELECT ポリシーが無く、
-- トリガーからの記録や参照ができない場合に、以下だけを実行してください。
-- （17_additional_security.sql を再実行しても同じです）

DROP POLICY IF EXISTS "Allow insert into audit_logs" ON audit_logs;
CREATE POLICY "Allow insert into audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow select audit_logs for admins" ON audit_logs;
CREATE POLICY "Allow select audit_logs for admins" ON audit_logs FOR SELECT USING (true);


-- ===========================================
-- 1. ユーザーID すべて（profiles 一覧）
-- ===========================================

SELECT
  id,
  full_name,
  full_name_kana,
  email,
  created_at,
  updated_at
FROM profiles
ORDER BY created_at DESC;


-- ===========================================
-- 2. ユーザーID のみの一覧（カンマ区切り等に加工したい場合）
-- ===========================================

SELECT id FROM profiles ORDER BY created_at DESC;


-- ===========================================
-- 3. auth.users と profiles の突き合わせ
--    （Auth にいるが profiles にない／その逆の確認）
-- ===========================================

-- auth.users に存在し、profiles に存在する（正常）
SELECT u.id, u.email, u.created_at, p.full_name
FROM auth.users u
JOIN profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- auth.users にいるが profiles にいない（要: create_missing_profiles 等）
-- SELECT u.id, u.email, u.created_at
-- FROM auth.users u
-- LEFT JOIN profiles p ON p.id = u.id
-- WHERE p.id IS NULL;


-- ===========================================
-- 4. 予約に紐づく user_id の一覧（重複除く）
-- ===========================================

SELECT DISTINCT r.user_id
FROM reservations r
ORDER BY r.user_id;


-- ===========================================
-- 5. ユーザーID と予約件数
-- ===========================================

SELECT
  p.id,
  p.full_name,
  p.email,
  COUNT(r.id) AS reservation_count
FROM profiles p
LEFT JOIN reservations r ON r.user_id = p.id
GROUP BY p.id, p.full_name, p.email
ORDER BY reservation_count DESC;


-- ===========================================
-- 6. 監査ログ（DML・DDL）— 17b 実行後
-- ===========================================

-- 直近の全アクティビティ
-- SELECT action, table_name, record_id, new_data, created_at
-- FROM audit_logs ORDER BY created_at DESC LIMIT 100;

-- DDL のみ（CREATE / ALTER / DROP 等）
-- SELECT action, table_name, new_data, created_at
-- FROM audit_logs WHERE action = 'ddl' ORDER BY created_at DESC;
