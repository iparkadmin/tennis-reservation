# Git 経由で Vercel に連携してデプロイする

この手順に従うと、**GitHub のリポジトリを Vercel に接続し、main への push のたびに自動デプロイ**されます。

---

## 前提

- リポジトリ **vault**（または Antigravity）が **GitHub にあり、push 済み**
- **Vercel アカウント**がある（GitHub 連携済み推奨）
- Supabase の **Project URL / anon key / service_role key** を控えている（`app/.env.local` 参照）

---

## Step 1: GitHub と Vercel を連携（初回のみ）

1. **https://vercel.com** にログイン
2. 右上 **Add New...** → **Project**
3. **Import Git Repository** の一覧から **vault**（または接続したいリポジトリ）を選ぶ
4. リポジトリが一覧にない場合:
   - **Adjust GitHub App Permissions** をクリック
   - 対象の **Organization** または **Your repositories** で vault にチェック → **Save**
   - 再度 **Import** で vault を選択

これで「Git 経由で Vercel に連携」した状態になります。

---

## Step 2: プロジェクト設定（Import 時）

| 設定項目 | 入力値 |
|----------|--------|
| **Project Name** | 任意（例: `tennis-court-reservation`） |
| **Root Directory** | **`vault/tennis-reservation`** または **`tennis-reservation`**（リポジトリ構造による。GitHub で `tennis-reservation` の位置を確認） |
| **Framework Preset** | Next.js（自動検出のまま） |
| **Build Command** | 未指定 |
| **Output Directory** | 未指定 |
| **Install Command** | 未指定 |

- **Root Directory** は **Edit** をクリックし、`tennis-reservation` と入力して **Continue**。

---

## Step 3: 環境変数を設定（Import 画面で）

**Environment Variables** で次の 4 つを追加（Production / Preview / Development にチェック）:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yawzyrzfbphxrthlrzjg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （Supabase の anon public キー） |
| `NEXT_PUBLIC_APP_URL` | いったん `https://localhost:3000` で可。デプロイ後に本番 URL に変更して Redeploy |
| `SUPABASE_SERVICE_ROLE_KEY` | （Supabase の service_role キー） |

値は **`tennis-reservation/app/.env.local`** を参照してください。

---

## Step 4: デプロイ実行

1. **Deploy** をクリック
2. ビルド完了（2〜5 分）を待つ
3. 表示された **URL**（例: `https://tennis-court-reservation-xxx.vercel.app`）で動作確認

---

## Step 5: デプロイ後の設定

1. **Vercel**  
   - **Settings** → **Environment Variables** で  
     `NEXT_PUBLIC_APP_URL` を **表示された本番 URL** に変更  
   - **Deployments** の最新デプロイの **⋯** → **Redeploy** で再デプロイ

2. **Supabase**  
   - **Authentication** → **URL Configuration**
   - **Site URL**: 上記本番 URL
   - **Redirect URLs** に以下を追加 → **Save**:
     - `https://あなたのドメイン.vercel.app/**`
     - `https://あなたのドメイン.vercel.app/login`
     - `https://あなたのドメイン.vercel.app/forgot-password`

---

## 今後の運用（Git 経由の自動デプロイ）

連携済みなので、**main ブランチに push するたびに Vercel が自動でビルド・デプロイ**します。

```powershell
cd c:\Dev\vault
git add .
git commit -m "feat: 〇〇を追加"
git push origin main
```

- Vercel ダッシュボードの **Deployments** で進行状況を確認できます。
- 失敗した場合は **Build Logs** で原因を確認してください。

---

## トラブルシューティング

| 現象 | 対処 |
|------|------|
| リポジトリが Vercel の一覧に出ない | GitHub App の権限で vault を選択し直す |
| ビルドが 404 / ファイルがない | Root Directory を確認。`vault/tennis-reservation` または `tennis-reservation` を試す。詳細は `29_vercel_deploy_troubleshooting.md` |
| **No Next.js version detected** | Root Directory を **`vault/tennis-reservation`** または **`tennis-reservation`** に変更 → Redeploy |
| `supabaseUrl is required` | 上記 4 つの環境変数が設定されているか確認 → **Redeploy** |
| ログイン後に localhost や 404 | Supabase の **Site URL** と **Redirect URLs** を本番 URL に設定 |

詳細: [06_vercel_deployment_guide.md](./06_vercel_deployment_guide.md) / [07_vercel_env_variables.md](./07_vercel_env_variables.md)
