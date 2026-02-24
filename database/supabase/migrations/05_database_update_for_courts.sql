-- ===========================================
-- テニスコート予約システム - コート2面対応のデータベース更新
-- ===========================================
-- このSQLをSupabaseのSQL Editorで実行してください
-- Dashboard > SQL Editor > New Query

-- ===========================================
-- 1. courts テーブル（コート情報）
-- ===========================================
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 例: "コートA", "コートB"
  display_name TEXT NOT NULL, -- 表示名: "コートA", "コートB"
  is_active BOOLEAN DEFAULT true, -- 使用可能かどうか
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- courtsテーブルのRLSを有効化
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがコート一覧を閲覧可能
CREATE POLICY "Anyone can view courts" ON courts
  FOR SELECT USING (true);

-- 初期データ：コートAとコートBを追加
INSERT INTO courts (name, display_name, is_active)
VALUES 
  ('court_a', 'コートA', true),
  ('court_b', 'コートB', true)
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 2. reservations テーブルに court_id カラムを追加
-- ===========================================
-- 既存の制約を削除（後で再作成するため）
ALTER TABLE reservations 
  DROP CONSTRAINT IF EXISTS unique_booking;

-- court_idカラムを追加（既存の予約にはデフォルトでコートAを設定）
ALTER TABLE reservations 
  ADD COLUMN IF NOT EXISTS court_id UUID REFERENCES courts(id) ON DELETE RESTRICT;

-- 既存の予約にコートAを設定（コートAのIDを取得して設定）
UPDATE reservations 
SET court_id = (SELECT id FROM courts WHERE name = 'court_a' LIMIT 1)
WHERE court_id IS NULL;

-- court_idをNOT NULLに設定
ALTER TABLE reservations 
  ALTER COLUMN court_id SET NOT NULL;

-- ===========================================
-- 3. 制約の再作成（court_idを含む）
-- ===========================================
-- 同一コート・同一日時の重複予約を防止
ALTER TABLE reservations 
  ADD CONSTRAINT unique_booking 
  UNIQUE (court_id, booking_date, start_time);

-- ===========================================
-- 4. インデックスの追加
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_reservations_court_id 
  ON reservations(court_id);

CREATE INDEX IF NOT EXISTS idx_reservations_court_date 
  ON reservations(court_id, booking_date);

-- ===========================================
-- 5. 既存の関数の更新（court_idを考慮）
-- ===========================================
-- check_daily_limit関数を更新（コートごとに1日2時間制限を適用）
CREATE OR REPLACE FUNCTION check_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  total_hours INTERVAL;
BEGIN
  -- 同じコート・同じ日の既存予約時間を集計
  SELECT COALESCE(SUM(end_time - start_time), INTERVAL '0 hours')
  INTO total_hours
  FROM reservations
  WHERE user_id = NEW.user_id
    AND court_id = NEW.court_id
    AND booking_date = NEW.booking_date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- 新規予約を加えて2時間を超える場合はエラー
  IF (total_hours + (NEW.end_time - NEW.start_time)) > INTERVAL '2 hours' THEN
    RAISE EXCEPTION '同一コートでの1日の予約時間は最大2時間までです。現在の予約時間: %', total_hours;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 完了メッセージ
-- ===========================================
-- 実行後、以下を確認してください:
-- 1. Table Editor で courts テーブルが作成されていること
-- 2. reservations テーブルに court_id カラムが追加されていること
-- 3. 既存の予約に court_id が設定されていること
-- 4. unique_booking 制約が (court_id, booking_date, start_time) になっていること
