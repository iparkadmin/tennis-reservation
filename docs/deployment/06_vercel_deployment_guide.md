# Vercelデプロイ手順ガイド

## 本番の正しいプロジェクト

- **ドメイン**: `tennis-reservation-one.vercel.app`
- 類似の別 Vercel プロジェクトは削除し、上記ドメインのプロジェクトのみ運用する。削除は Vercel ダッシュボード → 対象プロジェクト → Settings → Danger Zone → Delete Project。

---

## 📋 前提条件

- ✅ Vercelアカウント作成済み
- ✅ GitHubアカウント（必要）
- ✅ Gitがインストールされていること（Windowsには通常含まれています）

---

## Step 1: GitHubリポジトリの作成

### 1.1 GitHubでリポジトリを作成

1. **GitHubにログイン** → https://github.com
2. **右上の「+」** → **「New repository」** をクリック
3. リポジトリ情報を入力：
   - **Repository name**: `tennis-court-reservation-app`
   - **Description**: `テニスコート予約システム`
   - **Public** または **Private** を選択
   - **「Add a README file」はチェックしない**（既にREADMEがあるため）
4. **「Create repository」** をクリック

### 1.2 リポジトリURLをコピー

作成後、表示されるURLをコピー（例：`https://github.com/your-username/tennis-court-reservation-app.git`）

---

## Step 2: Gitでプロジェクトを初期化・プッシュ

### 2.1 プロジェクトディレクトリでGitを初期化

```powershell
cd c:\Dev\vault\tennis-reservation\tennis-app
git init
```

### 2.2 ファイルをステージング

```powershell
git add .
```

### 2.3 初回コミット

```powershell
git commit -m "Initial commit: Tennis reservation app MVP"
```

### 2.4 GitHubリポジトリに接続

```powershell
git remote add origin https://github.com/your-username/tennis-court-reservation-app.git
```

（`your-username`を実際のGitHubユーザー名に置き換えてください）

### 2.5 ブランチ名をmainに変更（必要に応じて）

```powershell
git branch -M main
```

### 2.6 GitHubにプッシュ

```powershell
git push -u origin main
```

**注意**: 初回プッシュ時、GitHubの認証が求められます：
- **Personal Access Token** を使用する必要があります
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- 新しいトークンを作成し、`repo`権限を付与
- パスワードの代わりにトークンを使用

---

## Step 3: Vercelでプロジェクトをインポート

### 3.1 Vercelにログイン

1. **https://vercel.com** にアクセス
2. **「Sign Up」** または **「Log In」** をクリック
3. **「Continue with GitHub」** を選択してGitHubアカウントと連携

### 3.2 プロジェクトをインポート

1. Vercelダッシュボードで **「Add New...」** → **「Project」** をクリック
2. **「Import Git Repository」** で先ほど作成したリポジトリを選択
3. **「Import」** をクリック

### 3.3 プロジェクト設定

Vercelが自動検出する設定：
- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: **空のまま**（何も入力しない）
- **Build Command**: `npm run build`（自動）
- **Output Directory**: `.next`（自動）
- **Install Command**: `npm install`（自動）

**⚠️ 重要**: リポジトリ `tennis-court-reservation-app` では、`package.json` や `src/` がリポジトリのルートにあります。Root Directory は**空**にしてください。`tennis-app` 等を指定すると 404 になります。

---

## Step 4: 環境変数の設定

### 4.1 環境変数を追加

Vercelのプロジェクト設定画面で：

1. **「Environment Variables」** セクションを開く
2. 以下の環境変数を追加：

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.example` を参照 | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.example` を参照 | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://tennis-reservation-one.vercel.app` | Production, Preview, Development |

**注意**: `NEXT_PUBLIC_APP_URL`は、デプロイ後にVercelが提供するURLに置き換えてください

### 4.2 環境変数の確認

すべての環境変数が追加されたことを確認

---

## Step 5: デプロイ実行

### 5.1 デプロイ開始

1. **「Deploy」** ボタンをクリック
2. Vercelが自動的に以下を実行：
   - GitHubからコードを取得
   - 依存関係をインストール（`npm install`）
   - ビルドを実行（`npm run build`）
   - デプロイ

### 5.2 デプロイ完了を待つ

通常、初回デプロイは2-5分かかります

---

## Step 6: デプロイ後の確認

### 6.1 デプロイURLを確認

デプロイ完了後、Vercelが以下のようなURLを提供：
- `https://tennis-reservation-one.vercel.app`（本番ドメイン）

### 6.2 動作確認

1. 提供されたURLにアクセス
2. トップページが表示されることを確認
3. ログインページにアクセス
4. 新規登録でテストアカウントを作成

---

## Step 7: Supabaseの設定確認

### 7.1 Supabaseで認証設定を確認

1. Supabaseダッシュボード → **Authentication** → **URL Configuration**
2. **Site URL** をVercelの本番URLに設定：
   - 本番: `https://tennis-reservation-one.vercel.app`
   - **「Save changes」** をクリック
3. **Redirect URLs** に以下を追加：
   - `https://tennis-reservation-one.vercel.app/**`
   - `https://tennis-reservation-one.vercel.app/login`
   - `https://tennis-reservation-one.vercel.app/forgot-password`
   - `https://tennis-reservation-one.vercel.app/dashboard`
   - `https://tennis-reservation-one.vercel.app/my-bookings`
   - **「Save」** をクリック

### 7.2 メール認証リダイレクトエラーの対処

メール認証のリンクをクリックした後、`localhost:3000`への接続が拒否されるエラーが発生する場合：

1. **SupabaseのURL設定を確認**
   - Site URLがVercelの本番URLになっているか確認
   - Redirect URLsにVercelのURLが追加されているか確認

2. **エラーが発生した場合**
   - `ERR_CONNECTION_REFUSED`: Site URLが`localhost:3000`になっている可能性
   - `404: DEPLOYMENT_NOT_FOUND`: URLの`xxxxx`部分が実際のURLと一致していない可能性
   - 解決策: Vercelダッシュボードで実際のURLを確認し、Supabaseの設定を更新

---

## Step 8: データベースのセットアップ

### 8.1 Supabaseでテーブル作成

まだ実行していない場合：

1. Supabaseダッシュボード → **SQL Editor**
2. `doc/02_database_setup.sql` の内容をコピー
3. 新しいクエリとして貼り付け
4. **Run** をクリック

---

## 🔧 トラブルシューティング

### ビルドエラーが発生する場合

1. **Vercelのビルドログを確認**
   - プロジェクト → **Deployments** → 失敗したデプロイをクリック
   - **Build Logs** を確認

2. **よくあるエラー**:
   - `Root Directory`が間違っている → **空**に設定（`tennis-court-reservation-app` リポジトリの場合）
   - 環境変数が設定されていない → 環境変数を再確認
   - 依存関係のエラー → `package.json`を確認

### 環境変数が反映されない場合

1. 環境変数を再設定
2. デプロイを再実行
3. ブラウザのキャッシュをクリア

### 認証が動作しない場合

1. SupabaseのURL Configurationを確認
2. Redirect URLsが正しく設定されているか確認
3. 環境変数が正しく設定されているか確認

---

## 📝 今後の更新手順

コードを更新する場合：

```powershell
cd c:\Dev\vault\tennis-reservation\tennis-app
git add .
git commit -m "更新内容の説明"
git push origin main
```

Vercelが自動的に再デプロイします。

---

## ✅ チェックリスト

- [ ] GitHubリポジトリを作成
- [ ] Gitでプロジェクトをプッシュ
- [ ] VercelアカウントとGitHubを連携
- [ ] Vercelでプロジェクトをインポート
- [ ] Root Directoryは**空**のまま（`tennis-court-reservation-app` の場合）
- [ ] 環境変数を設定
- [ ] デプロイを実行
- [ ] デプロイURLで動作確認
- [ ] SupabaseのURL Configurationを設定
- [ ] データベーステーブルを作成

---

*最終更新: 2025年1月*
