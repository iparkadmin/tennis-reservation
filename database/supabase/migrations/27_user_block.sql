-- ===========================================
-- テニスコート予約システム - ユーザーブロック機能
-- ===========================================
-- profiles に is_blocked を追加し、ブロックされたユーザーは
-- 予約の作成・変更・キャンセルができないようにする
-- ===========================================

-- ===========================================
-- 1. profiles に is_blocked カラムを追加
-- ===========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

UPDATE profiles SET is_blocked = false WHERE is_blocked IS NULL;

-- ===========================================
-- 2. ブロック判定用ヘルパー関数
-- ===========================================
CREATE OR REPLACE FUNCTION public.is_blocked_user(target_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_blocked FROM profiles WHERE id = target_user_id),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_blocked_user(UUID) TO authenticated;

-- ===========================================
-- 3. profiles: 管理者は任意のプロフィールを更新可能（ブロック操作用）
-- ===========================================
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ===========================================
-- 4. reservations: ブロックユーザーは予約の INSERT / UPDATE / DELETE 不可
-- ===========================================
-- INSERT: ブロックされていない認証ユーザーのみ予約作成可能
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON reservations;
CREATE POLICY "Authenticated users can create reservations" ON reservations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND NOT public.is_blocked_user(auth.uid())
  );

-- UPDATE: ブロックされていないユーザーのみ自分の予約を更新可能
DROP POLICY IF EXISTS "Users can update own reservations" ON reservations;
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (
    auth.uid() = user_id AND NOT public.is_blocked_user(auth.uid())
  );

-- DELETE: ブロックされていないユーザーのみ自分の予約を削除（キャンセル）可能
DROP POLICY IF EXISTS "Users can delete own reservations" ON reservations;
CREATE POLICY "Users can delete own reservations" ON reservations
  FOR DELETE USING (
    auth.uid() = user_id AND NOT public.is_blocked_user(auth.uid())
  );

-- ===========================================
-- 5. 管理者による予約の代行作成（ブロックユーザーへの作成を許可）
-- ===========================================
-- 管理者が他ユーザーに代わって予約を作成する場合、user_id は対象ユーザー。
-- 既存の "Authenticated users can create reservations" は auth.uid() = user_id を要求するため、
-- 管理者用の INSERT ポリシーを追加する。
DROP POLICY IF EXISTS "Admins can insert reservations for any user" ON reservations;
CREATE POLICY "Admins can insert reservations for any user" ON reservations
  FOR INSERT WITH CHECK (public.is_admin());
