# テニスコート予約アプリ — コピー環境 PC引越し・引き継ぎガイド

> 最終更新: 2026-03-16

コピー環境を別PCに移行し、開発・運用を引き継ぐための手順書です。

---

## 目次

1. [全体構成図](#1-全体構成図)
2. [前提条件・必要なもの](#2-前提条件必要なもの)
3. [アカウント情報の引き継ぎ](#3-アカウント情報の引き継ぎ)
4. [新PCでのセットアップ手順](#4-新pcでのセットアップ手順)
5. [環境変数の設定](#5-環境変数の設定)
6. [ローカル開発環境の起動確認](#6-ローカル開発環境の起動確認)
7. [Vercel の接続確認](#7-vercel-の接続確認)
8. [GitHub Actions の確認](#8-github-actions-の確認)
9. [Supabase の管理](#9-supabase-の管理)
10. [Cursor IDE の設定](#10-cursor-ide-の設定)
11. [プロジェクト構造リファレンス](#11-プロジェクト構造リファレンス)
12. [日常運用チェックリスト](#12-日常運用チェックリスト)
13. [トラブルシューティング](#13-トラブルシューティング)
14. [関連ドキュメント一覧](#14-関連ドキュメント一覧)

---

## 1. 全体構成図

```
[開発PC]
  └── c:\Dev\tennis-reservation/   ← Git リポジトリ（ローカル）
        │
        ├── git push ──────────► [GitHub] iparkadmin/tennis-reservation
        │                              │
        │                              ├── Vercel 自動デプロイ
        │                              │     └── https://tennis-reservation-five.vercel.app
        │                              │
        │                              └── GitHub Actions（Supabase Keep Alive）
        │
        └── app/.env.local ────► [Supabase] コピー環境プロジェクト
                                       └── DB / Auth / Storage
```

### サービス一覧

| サービス | URL | 用途 |
|----------|-----|------|
| **GitHub** | https://github.com/iparkadmin/tennis-reservation | ソースコード管理 |
| **Vercel** | https://vercel.com/muramatsus-projects | ホスティング・デプロイ |
| **Supabase** | https://supabase.com/dashboard/org/qtgzpqlzgojkjwsigvww | DB・認証・API |
| **本番サイト** | https://tennis-reservation-five.vercel.app | 公開URL |

---

## 2. 前提条件・必要なもの

### ソフトウェア

| ソフトウェア | バージョン | 確認コマンド |
|-------------|-----------|-------------|
| **Node.js** | 18.0.0 以上 | `node -v` |
| **npm** | 9.0.0 以上 | `npm -v` |
| **Git** | 最新推奨 | `git -v` |
| **Cursor** | 最新推奨（任意） | — |

### アカウント

| サービス | アカウント | 備考 |
|----------|-----------|------|
| GitHub | `iparkadmin` | リポジトリオーナー |
| Vercel | `muramatsus-projects` | デプロイ先 |
| Supabase | 組織 `qtgzpqlzgojkjwsigvww` | DB管理 |

---

## 3. アカウント情報の引き継ぎ

以下の情報を安全な方法（対面、パスワードマネージャー共有等）で引き継いでください。

### 3.1 GitHub（iparkadmin）

- [ ] ログインメールアドレス・パスワード
- [ ] 二要素認証の設定（あれば引き継ぎ or 再設定）
- [ ] Personal Access Token（Git push 用）の発行方法を確認

**トークン発行手順:**
1. https://github.com/settings/tokens にアクセス
2. 「Generate new token (classic)」を選択
3. スコープ: `repo` にチェック
4. 生成されたトークンを安全に保存

### 3.2 Vercel（muramatsus-projects）

- [ ] ログインメールアドレス・パスワード
- [ ] Vercel と GitHub の連携が有効であることを確認

### 3.3 Supabase

- [ ] ログインメールアドレス・パスワード
- [ ] 以下の値をメモ（Supabase ダッシュボード > Settings > API）
  - Project URL
  - anon/public key
  - service_role key（秘密鍵 — 厳重管理）

### 3.4 GitHub Actions Secrets

リポジトリの Settings > Secrets and variables > Actions に以下が登録されていることを確認：

| Secret名 | 用途 |
|-----------|------|
| `SUPABASE_URL` | コピー環境の Supabase Project URL |
| `SUPABASE_ANON_KEY` | コピー環境の Supabase Anon Key |
| `TENNIS_ORIGIN_SUPABASE_URL` | 元環境の Supabase URL（任意） |
| `TENNIS_ORIGIN_SUPABASE_ANON_KEY` | 元環境の Supabase Anon Key（任意） |

---

## 4. 新PCでのセットアップ手順

### 4.1 Node.js のインストール

https://nodejs.org/ から LTS版（18以上）をインストール。

```powershell
# インストール確認
node -v   # v18.x.x 以上
npm -v    # 9.x.x 以上
```

### 4.2 Git のインストールと認証設定

https://git-scm.com/ からインストール。

```powershell
# ユーザー設定（引き継ぐ名前・メールに合わせる）
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 4.3 リポジトリのクローン

```powershell
cd C:\Dev
git clone https://iparkadmin@github.com/iparkadmin/tennis-reservation.git
cd tennis-reservation
```

> **ポイント**: URL に `iparkadmin@` を含めることで、正しいアカウントの認証情報が使われます。初回 push/pull 時に GitHub のトークン入力を求められます。

### 4.4 依存パッケージのインストール

```powershell
# ルートの依存関係
npm install

# app/ の依存関係
cd app
npm install
cd ..
```

---

## 5. 環境変数の設定

### 5.1 ファイルの作成

```powershell
# app/.env.example をコピーして .env.local を作成
Copy-Item app\.env.example app\.env.local
```

### 5.2 値の設定

`app/.env.local` を編集し、以下の値を設定：

```env
# Supabase ダッシュボード > Settings > API から取得
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Service Role Key（サーバーサイドのみ使用 — 秘密鍵）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# アプリURL（ローカル開発時）
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 管理画面のデフォルト管理者ID（任意）
# NEXT_PUBLIC_ADMIN_ID=admin@example.com
```

### 5.3 Vercel の環境変数

Vercel ダッシュボード（Settings > Environment Variables）にも同じ変数が設定されている必要があります。

| 変数名 | 環境 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Production（本番URLを設定） |

> 既に設定済みであればそのままで問題ありません。Vercel の環境変数は PC に依存しないため、引越しで変更は不要です。

---

## 6. ローカル開発環境の起動確認

```powershell
cd C:\Dev\tennis-reservation

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開き、アプリが表示されることを確認。

### 確認チェックリスト

- [ ] トップページが表示される
- [ ] ログイン画面が表示される
- [ ] 管理画面（/admin/login）にアクセスできる

---

## 7. Vercel の接続確認

### 7.1 自動デプロイの確認

Vercel は GitHub リポジトリと連携しており、`main` ブランチへの push で自動デプロイされます。

```powershell
# テスト: 何か小さな変更を push してデプロイを確認
git push origin main
```

デプロイ状況は以下で確認：
- Vercel ダッシュボード: https://vercel.com/muramatsus-projects
- GitHub の Deployments タブ

### 7.2 デプロイURL

| 環境 | URL |
|------|-----|
| Production | https://tennis-reservation-five.vercel.app |
| Preview | push ごとに生成される一時URL |

---

## 8. GitHub Actions の確認

### Supabase Keep Alive ワークフロー

Supabase の無料枠プロジェクトは7日間操作がないと一時停止されます。このワークフローが定期的に API を呼び出してスリープを防止しています。

- **スケジュール**: 毎週日曜・水曜 9:00 UTC（日本時間 18:00）
- **確認**: https://github.com/iparkadmin/tennis-reservation/actions

### Secrets の設定（新規の場合）

リポジトリの Settings > Secrets and variables > Actions で設定：

1. `SUPABASE_URL` — Supabase の Project URL
2. `SUPABASE_ANON_KEY` — Supabase の anon key

---

## 9. Supabase の管理

### ダッシュボードアクセス

https://supabase.com/dashboard/org/qtgzpqlzgojkjwsigvww

### DB マイグレーション

新しい SQL マイグレーションを実行する方法：

1. **SQL Editor**（推奨）: Supabase ダッシュボード > SQL Editor に SQL を貼り付けて実行
2. **Management API**: `database/scripts/run-sql-via-api.js` を使用

```powershell
# Management API を使う場合
cd database/scripts
node run-sql-via-api.js ../supabase/migrations/30_utilization_records.sql
```

### マイグレーションファイルの場所

```
database/supabase/migrations/   ← 個別マイグレーション（番号順に実行）
database/supabase/00_full_setup_fresh.sql  ← 新規セットアップ時のフルSQL
```

---

## 10. Cursor IDE の設定

### ワークスペースルール

`.cursor/rules/environment-workflow.mdc` にコピー環境と元環境の切り替えルールが定義されています。Cursor でこのリポジトリを開くと自動的に読み込まれます。

### ルールの概要

- 指示に環境の指定がない → **コピー環境** として作業
- 「元環境で」と明示 → **元環境** 向けの作業

> Cursor を使わない場合、このファイルは無視して問題ありません。

---

## 11. プロジェクト構造リファレンス

```
tennis-reservation/
├── app/                          # Next.js アプリ本体
│   ├── src/
│   │   ├── app/                  # App Router ページ
│   │   │   ├── page.tsx          # トップページ
│   │   │   ├── admin/            # 管理者向け画面
│   │   │   ├── dashboard/        # ユーザーダッシュボード
│   │   │   ├── member/           # 会員向けページ
│   │   │   └── api/              # API Routes
│   │   ├── components/           # 共通コンポーネント
│   │   └── lib/                  # ユーティリティ・定数
│   ├── public/                   # 静的ファイル
│   │   ├── logo-white.svg
│   │   └── manual/               # 管理者マニュアル PDF
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── database/
│   ├── supabase/migrations/      # DB マイグレーション SQL
│   └── scripts/                  # DB 操作スクリプト
├── docs/
│   ├── app/                      # アプリ設計・運用ドキュメント
│   ├── business/                 # 事業要件
│   ├── deployment/               # デプロイ手順
│   ├── manual/                   # 管理者マニュアル原本
│   ├── migration/                # この引越しガイド
│   └── setup/                    # セットアップ補助
├── scripts/                      # 運用スクリプト
├── .github/workflows/            # GitHub Actions
├── vercel.json                   # Vercel 設定
├── package.json                  # ルート package.json
└── .env.example                  # 環境変数テンプレート
```

### 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.x | フロントエンド + API |
| React | 19.x | UI ライブラリ |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 3.x | スタイリング |
| Supabase | — | DB / 認証 / API |
| Vercel | — | ホスティング |
| lucide-react | — | アイコン |
| FullCalendar | 6.x | カレンダーUI |
| date-fns | 4.x | 日付操作 |

---

## 12. 日常運用チェックリスト

### コード変更〜デプロイ

```powershell
# 1. 変更を確認
git status
git diff

# 2. コミット
git add .
git commit -m "feat: description of change"

# 3. プッシュ（自動デプロイ）
git push origin main

# 4. デプロイ確認
#    → Vercel ダッシュボード or GitHub Deployments タブ
```

### 定期確認

- [ ] Supabase Keep Alive が正常に動作しているか（GitHub Actions タブ）
- [ ] Vercel のデプロイが成功しているか
- [ ] Supabase プロジェクトが Active 状態か

---

## 13. トラブルシューティング

### git push で認証エラー

```
remote: Repository not found.
```

**原因**: GitHub の認証情報（トークン）が無効または別アカウント用。

**対処**:
```powershell
# Windows 資格情報マネージャーから古い認証を削除
cmdkey /delete:git:https://github.com

# リモートURLにユーザー名を含める
git remote set-url origin https://iparkadmin@github.com/iparkadmin/tennis-reservation.git

# 再度 push（トークン入力を求められる）
git push origin main
```

### npm install でエラー

```powershell
# node_modules を削除して再インストール
Remove-Item -Recurse -Force app\node_modules
Remove-Item -Recurse -Force node_modules
npm install
cd app; npm install; cd ..
```

### Vercel デプロイが失敗

1. Vercel ダッシュボードでビルドログを確認
2. ローカルでビルドが通るか確認：
   ```powershell
   cd app
   npm run build
   ```
3. `docs/deployment/29_vercel_deploy_troubleshooting.md` を参照

### Supabase が一時停止（Paused）

1. https://supabase.com/dashboard でプロジェクトを開く
2. 「Restore project」をクリック
3. GitHub Actions の Keep Alive が動いているか確認

---

## 14. 関連ドキュメント一覧

| ドキュメント | 内容 |
|-------------|------|
| `docs/deployment/06_vercel_deployment_guide.md` | Vercel デプロイ詳細手順 |
| `docs/deployment/07_vercel_env_variables.md` | Vercel 環境変数の設定 |
| `docs/deployment/08_supabase_setup_guide.md` | Supabase セットアップ |
| `docs/deployment/15_supabase_keep_alive_setup.md` | Keep Alive 設定 |
| `docs/deployment/30_account_transfer_guide.md` | アカウント移管ガイド |
| `docs/deployment/ENVIRONMENT_MIGRATION_CHECKLIST.md` | 環境移行チェックリスト |
| `docs/deployment/SUPABASE_ACCESS_METHODS.md` | Supabase SQL 実行方法 |
| `docs/app/27_admin_setup_guide.md` | 管理者セットアップ |
| `docs/app/28_admin_usage_guide.md` | 管理画面の使い方 |

---

## 引越し完了チェックリスト

新PCで以下をすべて確認できたら引越し完了です。

- [ ] `git clone` でリポジトリを取得できた
- [ ] `npm install` が正常完了した
- [ ] `app/.env.local` を作成し、Supabase の値を設定した
- [ ] `npm run dev` でローカルサーバーが起動した
- [ ] http://localhost:3000 でアプリが表示された
- [ ] `git push origin main` が成功した
- [ ] Vercel で自動デプロイが実行された
- [ ] 本番サイト（https://tennis-reservation-five.vercel.app）が正常に動作している
- [ ] GitHub Actions の Supabase Keep Alive が正常に動作している
