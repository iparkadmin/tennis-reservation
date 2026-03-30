-- ===========================================
-- テニスコート予約システム - 管理者による利用者（utilizers）の管理
-- ===========================================
-- 管理者がユーザーに代わって利用者の追加・編集・削除を行えるようにする
-- ===========================================

CREATE POLICY "Admins can insert utilizers for any user" ON utilizers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update any utilizer" ON utilizers
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete any utilizer" ON utilizers
  FOR DELETE USING (public.is_admin());
