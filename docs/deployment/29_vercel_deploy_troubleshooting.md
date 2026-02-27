# Vercel デプロイ トラブルシューティング

## `cd app && npm run build` が exit 1 で失敗する場合

**推奨**: Root Directory を **`vault/tennis-reservation/app`** に設定してください。

| 設定 | 値 |
|------|-----|
| Root Directory | `vault/tennis-reservation/app` |
| Build Command | （未指定＝デフォルトの `npm run build`） |
| Install Command | （未指定＝デフォルトの `npm install`） |

これにより `cd app` が不要になり、Vercel が Next.js を自動検出してビルドします。

**Vercel での変更**:
1. プロジェクト → **Settings** → **General**
2. **Root Directory** を `vault/tennis-reservation/app` に変更（`vault/tennis-reservation` ではなく **`/app` まで含める**）
3. **Override** の Build Command / Install Command が設定されていれば **削除**（デフォルトに戻す）
4. **Save** → **Deployments** → 最新の **⋯** → **Redeploy**

---

## 昨日はできたが今日できない場合の確認

### 1. Root Directory の確認（従来の設定）

`vault/tennis-reservation` を Root にしている場合、`vercel.json` の `cd app && npm run build` が使われます。失敗する場合は上記「app を Root にする」設定を推奨します。

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

---

## デプロイが自動で走らない場合

詳細は [vercel_deploy_trigger.md](./vercel_deploy_trigger.md) を参照。主な対処:

1. **Git 連携の再接続**: Settings → Git で Disconnect → 再接続
2. **Deploy Hook**: Settings → Git → Deploy Hooks で URL を作成し、`Invoke-WebRequest -Uri "URL" -Method POST` で手動トリガー
3. **手動 Redeploy**: Deployments → 最新の ︙ → Redeploy
