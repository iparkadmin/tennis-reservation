-- ===========================================
-- テニスコート予約システム - 管理者ロールとRLSポリシー
-- ===========================================
-- 管理画面（/admin）用の認可基盤
-- 実行: Supabase SQL Editor またはマイグレーション
-- ===========================================

-- ===========================================
-- 1. profiles に role カラムを追加
-- ===========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 既存レコードにデフォルトを設定
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- 管理者の付与は手動で実行（例）:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- ===========================================
-- 2. 管理者判定用のヘルパー関数
-- ===========================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===========================================
-- 3. profiles: 管理者は全件 SELECT 可能
-- ===========================================
-- 既存の "Users can view own profile" は維持（一般ユーザー用）
-- 管理者用ポリシーを追加
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- ===========================================
-- 4. reservations: 管理者は全件 SELECT / UPDATE / DELETE 可能
-- ===========================================
-- 既存ポリシーは維持。管理者用を追加
CREATE POLICY "Admins can view all reservations" ON reservations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update any reservation" ON reservations
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete any reservation" ON reservations
  FOR DELETE USING (public.is_admin());

-- ===========================================
-- 5. courts: 管理者は UPDATE 可能（コート管理用）
-- ===========================================
CREATE POLICY "Admins can update courts" ON courts
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===========================================
-- 6. utilizers: 管理者は全件 SELECT 可能
-- ===========================================
CREATE POLICY "Admins can view all utilizers" ON utilizers
  FOR SELECT USING (public.is_admin());

-- ===========================================
-- 7. audit_logs: 管理者のみ SELECT 可能
-- ===========================================
-- 既存の "Allow select audit_logs for admins" が USING(true) の場合、
-- セキュリティのため管理者のみに制限する
DROP POLICY IF EXISTS "Allow select audit_logs for admins" ON audit_logs;
CREATE POLICY "Admins can view audit_logs" ON audit_logs
  FOR SELECT USING (public.is_admin());

-- ===========================================
-- 8. 関数の実行権限
-- ===========================================
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ===========================================
-- 完了メッセージ
-- ===========================================
-- 実行後:
-- 1. 管理者を1名以上付与: UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
-- 2. 管理画面（/admin）にログインして動作確認
