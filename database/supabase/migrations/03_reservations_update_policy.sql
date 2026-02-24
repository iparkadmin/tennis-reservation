-- ===========================================
-- 予約変更（UPDATE）用 RLS ポリシー
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 予約の変更機能を使うために必要なポリシーです。
-- 02_database_setup.sql 実行後に実行してください。

-- 既存ポリシーを削除してから作成（再実行時用）
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;

-- 自分の予約のみ更新可能（予約変更用）
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id);

-- ===========================================
-- 完了メッセージ
-- ===========================================
-- 実行後、Table Editor > reservations > RLS で
-- "Users can update own reservations" が追加されていることを確認してください。
