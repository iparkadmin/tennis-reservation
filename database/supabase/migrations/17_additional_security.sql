-- ===========================================
-- テニスコート予約システム - 追加セキュリティ対策
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- Dashboard > SQL Editor > New Query
--
-- 前提: 16_security_improvements.sql を実行済みであること
--
-- 目的:
-- 1. 予約変更機能の追加（UPDATE権限）
-- 2. コート管理機能の追加（管理者用）
-- 3. 監査ログ機能の追加
-- ===========================================

-- ===========================================
-- 1. 予約変更（UPDATE）ポリシーの追加
-- ===========================================
-- ユーザーが自分の予約を変更できるようにする
-- （既に存在する場合は削除してから再作成：再実行してもエラーにならないようにする）

DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (
    auth.uid() = user_id  -- 自分の予約のみ
  ) WITH CHECK (
    auth.uid() = user_id  -- 変更後も自分の予約であること
  );

-- 予約変更時も1日2時間制限を適用（トリガーで自動チェック）
-- check_daily_limit() 関数は既に存在するため、追加不要

-- ===========================================
-- 2. 監査ログテーブルの作成
-- ===========================================
-- セキュリティインシデント追跡用

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,           -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,       -- 'reservations', 'profiles'
  record_id UUID,                 -- 対象レコードのID
  old_data JSONB,                 -- 変更前データ
  new_data JSONB,                 -- 変更後データ
  ip_address INET,                -- IPアドレス（オプション）
  user_agent TEXT,                -- User-Agent（オプション）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 監査ログのRLSを有効化
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみ閲覧可能（アプリ側で実装）
-- 現時点では誰もアクセス不可（セキュアなデフォルト）
-- 管理者機能を実装する際に、管理者用ポリシーを追加

-- インデックス追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ===========================================
-- 3. 予約変更の監査ログ記録（トリガー）
-- ===========================================
-- 予約の作成・更新・削除を自動的に記録

CREATE OR REPLACE FUNCTION log_reservation_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT（作成）の場合
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (NEW.user_id, 'create', 'reservations', NEW.id, row_to_json(NEW)::jsonb);
    RETURN NEW;

  -- UPDATE（変更）の場合
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (NEW.user_id, 'update', 'reservations', NEW.id,
            row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    RETURN NEW;

  -- DELETE（削除）の場合
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (OLD.user_id, 'delete', 'reservations', OLD.id, row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを作成
DROP TRIGGER IF EXISTS audit_reservation_changes ON reservations;
CREATE TRIGGER audit_reservation_changes
  AFTER INSERT OR UPDATE OR DELETE ON reservations
  FOR EACH ROW EXECUTE FUNCTION log_reservation_changes();

-- ===========================================
-- 4. コート管理機能（管理者用）
-- ===========================================
-- 将来的な管理画面用のポリシー（現時点では無効化）

-- 管理者ロールの作成（アプリ側で実装）
-- profiles テーブルに role カラムを追加する場合:
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 管理者用ポリシー（コメントアウト、必要に応じて有効化）
/*
CREATE POLICY "Admins can manage courts" ON courts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
*/

-- ===========================================
-- 5. セキュリティ設定の確認
-- ===========================================

-- ✅ 確認1: reservationsテーブルのポリシー一覧
-- 期待される結果: SELECT, INSERT, UPDATE, DELETE の4つ
-- SELECT * FROM pg_policies WHERE tablename = 'reservations';

-- ✅ 確認2: 監査ログテーブルが作成されている
-- SELECT * FROM audit_logs LIMIT 5;

-- ✅ 確認3: トリガーが設定されている
-- SELECT tgname, tgtype FROM pg_trigger WHERE tgrelid = 'reservations'::regclass;

-- ===========================================
-- 6. テストクエリ（動作確認用）
-- ===========================================

-- 予約の作成テスト（監査ログに記録される）
/*
INSERT INTO reservations (user_id, court_id, booking_date, start_time, end_time)
VALUES (
  auth.uid(),
  (SELECT id FROM courts WHERE name = 'court_a' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '10:00',
  '11:00'
);

-- 監査ログを確認
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5;
*/

-- ===========================================
-- 完了メッセージ
-- ===========================================
-- 実行後、以下を確認してください：
-- 1. "Users can update own reservations" ポリシーが追加されている
-- 2. audit_logs テーブルが作成されている
-- 3. audit_reservation_changes トリガーが設定されている
-- 4. テスト予約を作成して、audit_logsに記録されることを確認
