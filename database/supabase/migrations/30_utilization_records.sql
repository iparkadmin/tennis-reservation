-- ===========================================
-- テニスコート予約システム - 利用実績記録（utilization_records）
-- ===========================================
-- 予約枠ごとの利用有無・マナー状況・メモ欄を記録
-- 参考: docs/app/31_utilization_records_requirements.md
-- ===========================================

-- ===========================================
-- 1. utilization_records テーブル
-- ===========================================
CREATE TABLE IF NOT EXISTS utilization_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  utilization_status TEXT NOT NULL DEFAULT 'unrecorded' CHECK (utilization_status IN ('used', 'no_show', 'unrecorded')),
  manners_status TEXT NOT NULL DEFAULT 'no_violation' CHECK (manners_status IN (
    'no_violation', 'loud_music', 'time_exceeded', 'garbage', 'smoking', 'restoration', 'manners_other'
  )),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reservation_id)
);

CREATE INDEX IF NOT EXISTS idx_utilization_records_reservation
  ON utilization_records(reservation_id);

CREATE INDEX IF NOT EXISTS idx_utilization_records_utilization_status
  ON utilization_records(utilization_status);

CREATE INDEX IF NOT EXISTS idx_utilization_records_manners_status
  ON utilization_records(manners_status);

-- ===========================================
-- 2. updated_at トリガー
-- ===========================================
CREATE OR REPLACE FUNCTION update_utilization_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_utilization_records_updated_at ON utilization_records;
CREATE TRIGGER trigger_utilization_records_updated_at
  BEFORE UPDATE ON utilization_records
  FOR EACH ROW EXECUTE FUNCTION update_utilization_records_updated_at();

-- ===========================================
-- 3. RLS（管理者のみアクセス可能）
-- ===========================================
ALTER TABLE utilization_records ENABLE ROW LEVEL SECURITY;

-- 管理者は全件参照・登録・更新・削除可能
CREATE POLICY "Admins can view utilization_records" ON utilization_records
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert utilization_records" ON utilization_records
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update utilization_records" ON utilization_records
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete utilization_records" ON utilization_records
  FOR DELETE USING (public.is_admin());
