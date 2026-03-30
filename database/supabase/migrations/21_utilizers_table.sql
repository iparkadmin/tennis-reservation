-- ===========================================
-- テニスコート予約システム - 利用者（登録ユーザー以外）テーブル
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- Dashboard > SQL Editor > New Query
--
-- 目的：登録ユーザーが、家族・友人など「自分以外の利用者」を登録できるようにする
-- ===========================================

-- ===========================================
-- 1. utilizers テーブル（利用者情報）
-- ===========================================
CREATE TABLE IF NOT EXISTS utilizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- utilizersテーブルのRLSを有効化
ALTER TABLE utilizers ENABLE ROW LEVEL SECURITY;

-- 自分の利用者のみ閲覧可能
CREATE POLICY "Users can view own utilizers" ON utilizers
  FOR SELECT USING (auth.uid() = user_id);

-- 自分の利用者のみ作成可能
CREATE POLICY "Users can insert own utilizers" ON utilizers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分の利用者のみ更新可能
CREATE POLICY "Users can update own utilizers" ON utilizers
  FOR UPDATE USING (auth.uid() = user_id);

-- 自分の利用者のみ削除可能
CREATE POLICY "Users can delete own utilizers" ON utilizers
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- 2. インデックス
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_utilizers_user_id
  ON utilizers(user_id);

-- ===========================================
-- 3. updated_at 自動更新トリガー
-- ===========================================
CREATE OR REPLACE FUNCTION update_utilizers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS utilizers_updated_at ON utilizers;
CREATE TRIGGER utilizers_updated_at
  BEFORE UPDATE ON utilizers
  FOR EACH ROW EXECUTE FUNCTION update_utilizers_updated_at();

-- ===========================================
-- 完了メッセージ
-- ===========================================
-- 実行後、以下を確認してください:
-- 1. Table Editor で utilizers テーブルが作成されていること
-- 2. RLS ポリシーが設定されていること
