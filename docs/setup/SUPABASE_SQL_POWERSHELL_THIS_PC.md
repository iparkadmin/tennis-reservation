# Supabase SQL 実行（この PC 向け・PowerShell）

> **対象**: tennis-reservation を編集するこの PC のみ。Node.js が使えないため、Supabase Management API は **PowerShell** で直接呼び出す。

## 前提

- `SUPABASE_ACCESS_TOKEN`（Personal Access Token）が必要
- 取得: https://supabase.com/dashboard/account/tokens
- プロジェクト ID: `yawzyrzfbphxrthlrzjg`（tennis reservation）

## 実行方法

### 方法1: 既存スクリプト（推奨）

```powershell
cd c:\Dev\vault\tennis-reservation\database\scripts
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxxx..."   # トークンに置換
$env:SUPABASE_PROJECT_REF = "yawzyrzfbphxrthlrzjg"   # 省略可（デフォルト）
.\run-sql-via-api.ps1 -SqlFile "..\supabase\migrations\21_utilizers_table.sql"
```

SQL ファイルパスは `database/scripts` からの相対パス、または絶対パス。

### 方法2: インライン PowerShell（スクリプトが失敗する場合）

```powershell
$token = $env:SUPABASE_ACCESS_TOKEN
$projectRef = "yawzyrzfbphxrthlrzjg"
$sql = Get-Content -Path "c:\Dev\vault\tennis-reservation\database\supabase\migrations\21_utilizers_table.sql" -Raw -Encoding UTF8
$url = "https://api.supabase.com/v1/projects/$projectRef/database/query"
$body = @{ query = $sql } | ConvertTo-Json

$response = Invoke-RestMethod -Uri $url -Method Post -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
} -Body $body -ContentType "application/json; charset=utf-8"

if ($response.error) { Write-Error $response.error } else { Write-Host "Success" }
```

実行前に `$env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"` を設定すること。

## よく使うマイグレーション

| ファイル | 用途 |
|----------|------|
| `database/supabase/migrations/21_utilizers_table.sql` | utilizers テーブル作成 |
| `database/supabase/migrations/22_utilizers_simplify.sql` | utilizers 簡素化（21 実行済みの場合） |

## 注意

- トークン未設定時は `SUPABASE_ACCESS_TOKEN を設定してください` で失敗する
- PowerShell の `-ForegroundColor` 等でパースエラーが出る場合は、該当行を削除または簡素化する
