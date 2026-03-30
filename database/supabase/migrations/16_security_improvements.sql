-- ===========================================
-- テニスコート予約システム - セキュリティ改善
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- Dashboard > SQL Editor > New Query
--
-- 目的：
-- 1. 予約データの個人情報保護（user_id, contact_notes等）
-- 2. 予約済みスロットのみを公開（空き状況確認用）
-- ===========================================

-- ===========================================
-- 1. 公開用VIEW：予約済みスロットのみ表示
-- ===========================================
-- 個人情報を含まない、予約済み時間帯のみを公開

CREATE OR REPLACE VIEW public_availability AS
SELECT
  id,                    -- 予約ID（参照用）
  court_id,              -- コートID
  booking_date,          -- 予約日
  start_time,            -- 開始時間
  end_time,              -- 終了時間
  created_at             -- 作成日時
FROM reservations;
-- 除外される項目：user_id, contact_notes, reservation_number

-- VIEWへのアクセス権限を設定（誰でも閲覧可能）
GRANT SELECT ON public_availability TO anon, authenticated;

-- ===========================================
-- 2. RLSポリシーの改善
-- ===========================================

-- 既存の「誰でも全予約を閲覧可能」ポリシーを削除
DROP POLICY IF EXISTS "Anyone can view reservations" ON reservations;

-- 新しいポリシー：自分の予約のみ閲覧可能
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (
    auth.uid() = user_id  -- 認証済みユーザーは自分の予約のみ閲覧可能
  );

-- 既存の他のポリシーはそのまま維持
-- - "Authenticated users can create reservations" (INSERT)
-- - "Users can delete own reservations" (DELETE)

-- ===========================================
-- 3. 確認クエリ
-- ===========================================

-- ✅ 確認1: public_availability VIEWが作成されていることを確認
-- SELECT * FROM public_availability LIMIT 5;

-- ✅ 確認2: reservationsテーブルのRLSポリシーを確認
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'reservations';

-- ✅ 確認3: VIEWのカラムを確認（user_idなどがないことを確認）
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'public_availability';

-- ===========================================
-- 4. 動作確認手順
-- ===========================================

-- 【匿名ユーザー（未ログイン）の場合】
-- ✅ public_availability VIEWは閲覧可能（予約済みスロットのみ）
-- ❌ reservationsテーブルは閲覧不可（個人情報保護）

-- 【認証済みユーザーの場合】
-- ✅ public_availability VIEWは閲覧可能
-- ✅ reservationsテーブルは自分の予約のみ閲覧可能
-- ✅ 自分の予約の詳細（contact_notes, reservation_number等）も閲覧可能

-- ===========================================
-- 5. アプリケーション側の実装ガイド
-- ===========================================

-- 空き状況確認画面：
-- SELECT * FROM public_availability
-- WHERE booking_date = '2026-01-20'
-- ORDER BY start_time;

-- マイページ（自分の予約一覧）：
-- SELECT * FROM reservations
-- WHERE user_id = auth.uid()
-- ORDER BY booking_date DESC;

-- ===========================================
-- 完了メッセージ
-- ===========================================
-- 実行後、以下を確認してください：
-- 1. public_availability VIEWが作成されている
-- 2. "Anyone can view reservations" ポリシーが削除されている
-- 3. "Users can view own reservations" ポリシーが追加されている
-- 4. 匿名ユーザーでも public_availability を閲覧可能
-- 5. reservations テーブルは本人のみ閲覧可能
