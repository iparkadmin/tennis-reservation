-- ===========================================
-- テニスコート予約システム - utilizers テーブル簡素化
-- ===========================================
-- 21 実行後に実行。氏名のみに簡素化（氏名カナ・display_order 削除）
-- ===========================================

-- full_name_kana カラムを削除
ALTER TABLE utilizers DROP COLUMN IF EXISTS full_name_kana;

-- display_order カラムを削除
ALTER TABLE utilizers DROP COLUMN IF EXISTS display_order;

-- display_order 用インデックスを削除
DROP INDEX IF EXISTS idx_utilizers_user_order;
