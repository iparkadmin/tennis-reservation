-- ===========================================
-- テニスコート予約システム - 予約と利用者の紐付けテーブル
-- ===========================================
-- 予約ごとにどの利用者（utilizers）が参加するかを管理
-- ===========================================

-- ===========================================
-- 1. reservation_utilizers テーブル
-- ===========================================
CREATE TABLE IF NOT EXISTS reservation_utilizers (
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  utilizer_id UUID NOT NULL REFERENCES utilizers(id) ON DELETE CASCADE,
  PRIMARY KEY (reservation_id, utilizer_id)
);

CREATE INDEX IF NOT EXISTS idx_reservation_utilizers_reservation
  ON reservation_utilizers(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_utilizers_utilizer
  ON reservation_utilizers(utilizer_id);

-- ===========================================
-- 2. RLS
-- ===========================================
ALTER TABLE reservation_utilizers ENABLE ROW LEVEL SECURITY;

-- 自分の予約かつ自分の利用者の場合のみ操作可能
CREATE POLICY "Users can view own reservation utilizers" ON reservation_utilizers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_utilizers.reservation_id AND r.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own reservation utilizers" ON reservation_utilizers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_utilizers.reservation_id AND r.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM utilizers u
      WHERE u.id = reservation_utilizers.utilizer_id AND u.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own reservation utilizers" ON reservation_utilizers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.id = reservation_utilizers.reservation_id AND r.user_id = auth.uid()
    )
  );

-- ===========================================
-- 3. 管理者用ポリシー
-- ===========================================
CREATE POLICY "Admins can view all reservation utilizers" ON reservation_utilizers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert any reservation utilizer" ON reservation_utilizers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete any reservation utilizer" ON reservation_utilizers
  FOR DELETE USING (public.is_admin());
