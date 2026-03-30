# Supabase アクセス方法（できる/できない 一覧）

AI や自動化で Supabase にアクセスする際の選択肢をまとめています。

---

## この PC での前提

**Node.js が使えない**ため、SQL 実行は **PowerShell** で Supabase Management API を直接呼び出す。

→ 詳細は `docs/setup/SUPABASE_SQL_POWERSHELL_THIS_PC.md` を参照

---

## できる場合

### 1. Supabase Management API（SQL 実行）推奨

**前提**: Personal Access Token (PAT) が必要

- **取得**: https://supabase.com/dashboard/account/tokens でトークンを作成
- **設定**: `SUPABASE_ACCESS_TOKEN` を環境変数に設定
- **実行**: Node.js が使える場合は `run-sql-via-api.js`、**使えない場合は `run-sql-via-api.ps1`**

```powershell
# PowerShell（Node.js 不要・この PC 向け）
cd tennis-reservation\database\scripts
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."
.\run-sql-via-api.ps1 -SqlFile "..\supabase\migrations\21_utilizers_table.sql"
```

```powershell
# Node.js（インストール済みの場合）
cd tennis-reservation
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."
node database/scripts/run-sql-via-api.js database/supabase/00_verify_restore_status.sql
```

### 2. psql（PostgreSQL 接続）

**前提**: Database Password と psql がインストール済み

- **接続文字列**: Supabase ダッシュボード → Connect → Connection string をコピー
- **実行例**:
```powershell
psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" -f database/supabase/00_full_setup_fresh.sql
```

### 3. Supabase CLI

**前提**: `supabase` CLI がインストール・リンク済み

```powershell
supabase db execute --project-ref yawzyrzfbphxrthlrzjg -f database/supabase/00_full_setup_fresh.sql
```

### 4. ブラウザ MCP（cursor-ide-browser）

**前提**: ブラウザで Supabase にログイン済みのタブが開いている

- Cursor の MCP 経由で、ログイン済みダッシュボードを操作できる場合あり
- セッションが切れていると利用不可

---

## できない場合

| 状況 | 理由 |
|------|------|
| 認証なしで API にアクセス | Management API は必ず Bearer トークンが必要 |
| ダッシュボードに直接ログイン | AI は外部サービスの認証情報を持たない |
| anon/service_role キーで SQL 実行 | これらは Data API 用。任意 SQL 実行は Management API または Direct DB 接続が必要 |
| .env.local の参照 | gitignore のため AI は読み込めない（ユーザーが手動で環境変数に設定する必要あり） |

---

## 推奨: Management API で SQL 実行する手順

### 方法A: PowerShell（Node.js 不要）

1. https://supabase.com/dashboard/account/tokens で **Generate new token** をクリック
2. トークンをコピー（例: `sbp_xxxxxxxx...`）
3. 実行:
   ```powershell
   cd tennis-reservation
   $env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."   # 取得したトークンに置換
   .\database\scripts\verify-and-restore.ps1
   ```
   - テーブルが4つ未満なら `00_full_setup_fresh.sql` を自動実行
   - 4つ揃っていればスキップ

### 方法B: Node.js（インストール済みの場合）

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."
node database/scripts/run-sql-via-api.js database/supabase/00_verify_restore_status.sql
```

### メールテンプレートの一括更新（Management API）

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."
.\database\scripts\update-email-templates.ps1
```

- `docs/deployment/supabase_email_templates/` 内の HTML を Supabase に反映
- トークンは Personal Access Token（`sbp_` で始まる）が必要

---

※ Site URL と Redirect URLs はダッシュボードで手動設定が必要です。
