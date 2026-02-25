# Vercel環境変数設定ガイド

## ⚠️ 重要：環境変数の設定

以下のような場合は、Vercelの環境変数が未設定または誤りです。

- ビルドエラー: `supabaseUrl is required`
- **アプリ起動時**: `Application error: a client-side exception has occurred`  
  → ブラウザコンソールに `[Supabase] Missing env: NEXT_PUBLIC_SUPABASE_URL or ...` が出ているか確認。画面上部にオレンジの「Supabase の環境変数が未設定です」バナーが出ている場合も同様。

## 設定手順

### Step 1: Vercelプロジェクトの設定画面を開く

1. Vercelダッシュボード → プロジェクトを選択
2. **Settings** タブをクリック
3. 左メニューから **Environment Variables** を選択

### Step 2: 環境変数を追加

以下の環境変数を追加してください（必須3つ + 推奨1つ）：

#### 1. NEXT_PUBLIC_SUPABASE_URL

| 項目 | 値 |
|------|-----|
| **Key** | `NEXT_PUBLIC_SUPABASE_URL` |
| **Value** | `.env.example` を参照（プロジェクトURLをコピー） |
| **Environment** | Production, Preview, Development（すべてチェック） |

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

| 項目 | 値 |
|------|-----|
| **Key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Value** | `.env.example` を参照（Anon Keyをコピー） |
| **Environment** | Production, Preview, Development（すべてチェック） |

#### 3. NEXT_PUBLIC_APP_URL

| 項目 | 値 |
|------|-----|
| **Key** | `NEXT_PUBLIC_APP_URL` |
| **Value** | 本番: `https://tennis-reservation-one.vercel.app` |
| **Environment** | Production, Preview, Development（すべてチェック） |

**注意**: `NEXT_PUBLIC_APP_URL`は、初回デプロイ後にVercelが提供するURLに更新してください。

#### 4. SUPABASE_SERVICE_ROLE_KEY（アカウント削除機能用・推奨）

| 項目 | 値 |
|------|-----|
| **Key** | `SUPABASE_SERVICE_ROLE_KEY` |
| **Value** | Supabaseダッシュボードの「Settings」→「API」→「service_role key」から取得 |
| **Environment** | Production, Preview, Development（すべてチェック） |
| **重要** | ⚠️ このキーは**秘密情報**です。クライアント側のコードに露出させないでください。 |

**注意**: 
- この環境変数は**アカウント削除機能**で使用されます
- 設定しない場合、アカウント削除時に`profiles`と`reservations`のみ削除され、`auth.users`は削除されません
- `auth.users`が残っていると、同じメールアドレスで再登録できません
- 完全なアカウント削除には、この環境変数の設定が**必須**です

### Step 3: 環境変数の確認

各環境変数が以下に設定されていることを確認：
- ✅ Production
- ✅ Preview  
- ✅ Development

**必須環境変数（3つ）**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

**推奨環境変数（1つ）**:
- `SUPABASE_SERVICE_ROLE_KEY`（アカウント削除機能を完全に動作させるために必要）

### Step 4: 再デプロイ

1. **Deployments** タブに移動
2. 最新のデプロイの **「...」** メニューをクリック
3. **「Redeploy」** を選択
4. **「Use existing Build Cache」** のチェックを外す（推奨）
5. **「Redeploy」** をクリック

---

## 環境変数の確認方法

### Vercelダッシュボードで確認

1. Settings → Environment Variables
2. 3つの環境変数が表示されていることを確認
3. 各環境変数の値が正しいことを確認

### ビルドログで確認

デプロイのビルドログで、環境変数が読み込まれているか確認：
- エラーが `supabaseUrl is required` から別のエラーに変わった場合、環境変数は読み込まれています
- まだ同じエラーが出る場合、環境変数の設定を再確認してください

---

## トラブルシューティング

### 環境変数を追加したのにエラーが出る場合

1. **環境変数を再保存**
   - 一度削除して、再度追加
   - 値に余分なスペースや改行がないか確認

2. **再デプロイ**
   - 環境変数を追加・変更した後は、必ず再デプロイが必要です
   - キャッシュをクリアして再デプロイ

3. **変数名の確認**
   - `NEXT_PUBLIC_` で始まっているか確認
   - 大文字・小文字が正しいか確認

4. **値の確認**
   - Supabaseダッシュボードから最新の値をコピー
   - 値が完全にコピーされているか確認

---

## Supabase の Project URL と anon key の確認方法

本番で使用する Supabase の Project URL は `.env.example` または `app/.env.local` を参照（例: `https://yawzyrzfbphxrthlrzjg.supabase.co`）。

### 手順

1. **Supabase にログイン**  
   https://supabase.com/dashboard を開き、プロジェクト **tennis court reservation** を選択します。

2. **Settings を開く**  
   左サイドバー下部の **歯車アイコン** をクリックし、**Project Settings**（Settings）を開きます。

3. **Project URL と API キーが載っているメニューを開く**  
   - 左の **PROJECT SETTINGS** の一覧で、**「API」** または **「API Keys」** をクリックします。  
   - 「General」の下、「Data API」「JWT Keys」の近くにある **API** / **API Keys** です。  
   - 開いた画面に **「Project URL」** と **「Project API keys」**（anon や service_role の表）が出ていれば、そのページで OK です。

4. **Project URL をコピー**
   - **「Project URL」** と書いてある欄の値（`https://xxxxxxxx.supabase.co` 形式）をコピーします。
   - これが **`NEXT_PUBLIC_SUPABASE_URL`** に使う値です。

5. **anon key をコピー**
   - **「Project API keys」** の表で、**「anon」** で **「public」** と書いてある行の、長いキー文字列を探します。
   - 形式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.` で始まる JWT。  
   - 隠れているときは **「Reveal」** や **目のアイコン** で表示してからコピーします。
   - これが **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** に使う値です。

6. **service_role key をコピー（アカウント削除機能用）**
   - 同じ **「Project API keys」** の表で、**「service_role」** で **「secret」** と書いてある行の、長いキー文字列を探します。
   - 隠れているときは **「Reveal」** や **目のアイコン** で表示してからコピーします。
   - これが **`SUPABASE_SERVICE_ROLE_KEY`** に使う値です。
   - ⚠️ **重要**: このキーは**秘密情報**です。クライアント側のコードに露出させないでください。

### メニュー名の目安（Supabase のバージョンで変わることがあります）

| 探すもの | 左メニューの名前の例 |
|----------|------------------------|
| Project URL と anon key がある画面 | **API** / **API Keys** |

「API」だけのときは、その中に **Project URL** と **Project API keys** のセクションがあるかを確認してください。

### 画面の目安

| 使う値 | 画面上の表記 | 形式の例 |
|--------|--------------|----------|
| Project URL | **Project URL** | `https://xxxxxxxx.supabase.co` |
| anon key | **anon** かつ **public** の API Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...`（長い文字列） |

### 注意

- **service_role** のキーは使わず、**anon（public）** のキーだけを使います。
- コピー時に、前後の空白や改行が入らないようにします。

---

*最終更新: 2025年1月*
