# Vercel デプロイ手順（今すぐ実行用）

## 前提

- リポジトリ **vault** が GitHub にプッシュ済み
- Vercel アカウントあり（GitHub 連携推奨）
- Supabase プロジェクト `yawzyrzfbphxrthlrzjg` の URL / anon key / service_role key を用意

---

## 1. 変更をプッシュ（未プッシュがあれば）

```powershell
cd c:\Dev\vault
git status
git add .
git commit -m "chore: fix vercel.json for app folder, update deploy docs"
git push origin main
```

---

## 2. Vercel でプロジェクトを追加

1. **https://vercel.com** にログイン
2. **Add New...** → **Project**
3. **Import Git Repository** で **vault**（または Antigravity）を選択 → **Import**

---

## 3. プロジェクト設定

| 項目 | 値 |
|------|-----|
| **Project Name** | 任意（例: `tennis-court-reservation`） |
| **Root Directory** | **`tennis-reservation`** を指定 |
| **Framework Preset** | Next.js（自動検出） |
| **Build Command** | 未指定でよい |
| **Output Directory** | 未指定でよい |
| **Install Command** | 未指定でよい |

- **Root Directory** で **Edit** をクリックし、`tennis-reservation` と入力して **Continue**。

---

## 4. 環境変数（必須）

**Environment Variables** で以下を追加（Production / Preview / Development すべてにチェック）:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yawzyrzfbphxrthlrzjg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | （Supabase の anon public キー） |
| `NEXT_PUBLIC_APP_URL` | デプロイ後に表示される URL（例: `https://xxxx.vercel.app`）。仮で `https://localhost:3000` でも可。後で本番 URL に更新して Redeploy |
| `SUPABASE_SERVICE_ROLE_KEY` | （Supabase の service_role キー・アカウント削除用） |

値は `tennis-reservation/app/.env.local` を参照してください。

---

## 5. デプロイ

1. **Deploy** をクリック
2. ビルド完了（2〜5 分）を待つ
3. 表示された URL で動作確認（トップ・ログイン・新規登録）

---

## 6. デプロイ後にやること

1. **NEXT_PUBLIC_APP_URL** を、Vercel が表示した本番 URL に更新 → **Redeploy**
2. **Supabase** の **Authentication** → **URL Configuration**:
   - **Site URL**: 上記本番 URL（例: `https://tennis-court-reservation-xxx.vercel.app`）
   - **Redirect URLs** に `https://あなたのドメイン.vercel.app/**` を追加

---

## トラブル

- ビルド失敗 → **Deployments** の **Build Logs** を確認
- `supabaseUrl is required` → 上記 4 つの環境変数が入っているか確認し、**Redeploy**
- 認証で localhost や 404 → Supabase の **Site URL** と **Redirect URLs** を確認

詳細: [06_vercel_deployment_guide.md](./06_vercel_deployment_guide.md) / [07_vercel_env_variables.md](./07_vercel_env_variables.md)
