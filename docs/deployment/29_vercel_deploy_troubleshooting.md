# Vercel デプロイ トラブルシューティング

## 昨日はできたが今日できない場合の確認

### 1. Root Directory の確認

**vault リポジトリ**の構造によって、Root Directory が異なります。

| リポジトリ構造 | Root Directory |
|----------------|----------------|
| リポジトリルート直下に `tennis-reservation` がある | `tennis-reservation` |
| リポジトリルート直下に `vault` があり、その中に `tennis-reservation` | `vault/tennis-reservation` |

**確認方法**: GitHub で vault リポジトリを開き、`tennis-reservation` フォルダがルート直下か、`vault/tennis-reservation` か確認。

**Vercel での変更**:
1. プロジェクト → **Settings** → **General**
2. **Root Directory** を上記の正しい値に変更
3. **Save** → **Deployments** → 最新の **⋯** → **Redeploy**

### 2. ビルドログの確認

1. **Vercel** → プロジェクト → **Deployments**
2. 失敗しているデプロイをクリック
3. **Building** の **View Function Logs** または **Build Logs** を確認
4. エラーメッセージに応じて対処:
   - `No Next.js version detected` → Root Directory を確認
   - `supabaseUrl is required` → 環境変数 4 つが設定されているか確認
   - `Module not found` → 依存関係の問題、`npm install` のキャッシュクリアを試す

### 3. 環境変数の確認

**Settings** → **Environment Variables** で以下が設定されているか確認:

| Key | 必須 |
|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ |
| `NEXT_PUBLIC_APP_URL` | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓（管理機能用） |

環境変数を変更した場合は **Redeploy** が必要です。

### 4. 手動で Redeploy を実行

1. **Deployments** タブ
2. 最新のデプロイ（成功・失敗どちらでも）の **⋯** メニュー
3. **Redeploy** を選択
4. **Redeploy** をクリック

### 5. デプロイをトリガーする（Git push）

```powershell
cd c:\Dev
git add .
git commit -m "chore: trigger deployment"
git push origin main
```

push 後、Vercel が自動でビルドを開始します。**Deployments** で進行状況を確認してください。
