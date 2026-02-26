-- ===========================================
-- テニスコート予約システム - 管理者メモ（admin_notes）
-- ===========================================
-- 運営担当がユーザーへの個別対応記録を残すためのテーブル
-- ===========================================

CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- 管理者のみ全件 SELECT / INSERT 可能
CREATE POLICY "Admins can view all admin_notes" ON admin_notes
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert admin_notes" ON admin_notes
  FOR INSERT WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at DESC);
