# utilizers テーブル マイグレーション実行手順

## 方法1: Supabase ダッシュボード（推奨・手動）

1. **Supabase ダッシュボード**にログイン
2. プロジェクト「tennis reservation」を選択
3. 左メニュー **SQL Editor** をクリック
4. **New query** をクリック
5. 以下の SQL をコピー＆ペーストして **Run** をクリック

```sql
-- utilizers テーブル（利用者情報）
CREATE TABLE IF NOT EXISTS utilizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE utilizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own utilizers" ON utilizers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own utilizers" ON utilizers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own utilizers" ON utilizers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own utilizers" ON utilizers
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_utilizers_user_id ON utilizers(user_id);

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
```

6. 成功後、**Table Editor** で `utilizers` テーブルが表示されることを確認

---

## 方法2: Management API（トークン設定済みの場合）

```powershell
cd c:\Dev\vault\tennis-reservation\database\scripts
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."  # トークンに置換
.\run-sql-via-api.ps1 -SqlFile "..\supabase\migrations\21_utilizers_table.sql"
```

トークン取得: https://supabase.com/dashboard/account/tokens  
詳細: `docs/setup/SUPABASE_SQL_POWERSHELL_THIS_PC.md`
