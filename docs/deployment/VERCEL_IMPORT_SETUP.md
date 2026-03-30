# tennis-reservation Vercel インポート・デプロイ設定

> **前提**: tennis-reservation は単独リポジトリ（vault モノレポは使用しない）

---

## 1. Vercel でプロジェクト作成

### 1.1 インポート

1. https://vercel.com にログイン
2. **Add New...** → **Project**
3. **Import Git Repository** で `tennis-reservation` リポジトリを選択
4. **Import** をクリック

### 1.2 Root Directory の設定

| 項目 | 設定値 |
|------|--------|
| **Root Directory** | **空のまま**（変更不要） |

※ リポジトリルートが tennis-reservation のため、`vercel.json` はそのままルートとして認識される

### 1.3 ビルド設定（vercel.json で自動読み込み）

| 項目 | 値 |
|------|-----|
| Framework Preset | Next.js |
| Build Command | `cd app && npm run build` |
| Output Directory | `app/.next` |
| Install Command | `npm install && cd app && npm install` |

※ 通常は自動検出されるため、変更不要。

---

## 2. 環境変数の設定

**Configure** 画面、またはデプロイ後の **Settings** → **Environment Variables** で以下を追加:

| Key | Value | 環境 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 新 Supabase の Project URL（`https://xxx.supabase.co`） | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 新 Supabase の anon key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | 初回は `https://xxx.vercel.app`（プレースホルダー可） | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | 新 Supabase の service_role key | Production, Preview, Development |

**取得方法**: Supabase Dashboard → **Settings** → **API**

---

## 3. デプロイ

1. **Deploy** をクリック
2. デプロイ完了後、表示される URL を控える（例: `https://tennis-reservation-xxx.vercel.app`）

---

## 4. デプロイ後の確認・修正

### 4.1 NEXT_PUBLIC_APP_URL の更新

デプロイ後の URL が確定したら:

1. Vercel → **Settings** → **Environment Variables**
2. `NEXT_PUBLIC_APP_URL` を実際の URL に更新
3. **Deployments** → 最新の **...** → **Redeploy**

### 4.2 Supabase Auth の URL 設定

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: 上記の Vercel URL を設定
3. **Redirect URLs** に追加:
   - `https://xxx.vercel.app/**`
   - `https://xxx.vercel.app/login`
   - `https://xxx.vercel.app/forgot-password`
   - `http://localhost:3000/**`（開発用）

