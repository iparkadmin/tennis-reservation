# テニスコート予約システム

完全無料のテニスコート予約システム。会員登録必須（セキュリティ強化のためゲスト予約は廃止）。コート2面（コートA・コートB）の予約管理に対応。

アプリURL：　https://tennis-reservation-one.vercel.app/login

---

## 📁 プロジェクト構造

```
tennis-reservation/
├── docs/                         # 📚 ドキュメント類
│   ├── README.md                 # ドキュメント一覧（詳細）
│   ├── business/                 # 事業要件定義書
│   │   ├── 01_requirements_specification.md
│   │   └── 02_requirements_revision_free_service.md
│   ├── app/                      # アプリケーション関連ドキュメント
│   │   ├── 00_SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md
│   │   ├── 09_mypage_requirements.md
│   │   ├── 10_email_notification_list.md
│   │   ├── 11_supabase_email_template_setup.md
│   │   ├── 18_rate_limiting_guide.md
│   │   ├── 20_service_role_key_setup.md
│   │   ├── 21_supabase_email_template_setup.md
│   │   ├── 22_supabase_email_template_troubleshooting.md
│   │   ├── 23_supabase_email_change_template_setup.md
│   │   ├── SECURITY_AUDIT_REPORT.md
│   │   └── SECURITY_EXPLANATION_FOR_AUDITORS.md
│   └── deployment/               # デプロイ関連ドキュメント
│       ├── 06_vercel_deployment_guide.md
│       ├── 07_vercel_env_variables.md
│       ├── 08_supabase_setup_guide.md
│       ├── 12_supabase_custom_smtp_setup.md
│       ├── 13_smtp2go_setup_guide.md
│       ├── 14_resend_smtp_setup_guide.md
│       └── GIT_VERCEL_DEPLOY.md
│
├── design/                       # 🎨 設計書類
│   └── database/                 # データベース設計
│       └── 15_court_update_execution_guide.md
│
├── database/                     # 🗄️ データベース関連
│   ├── supabase/
│   │   └── migrations/           # Supabaseマイグレーションファイル
│   │       ├── 02_database_setup.sql
│   │       ├── 03_reservations_update_policy.sql
│   │       ├── 04_database_update_for_mypage.sql
│   │       ├── 05_database_update_for_courts.sql
│   │       ├── 16_security_improvements.sql
│   │       └── 17_additional_security.sql
│   └── scripts/                  # データベーススクリプト
│       └── 19_admin_queries.sql
│
├── app/                          # 💻 アプリケーションコード
│   ├── src/, public/, package.json, README.md
│   └── （詳細は app/README.md）
│
├── vercel.json                   # Vercel設定
├── .gitignore
└── README.md
```

---

## 🚀 クイックスタート

### 1. データベースセットアップ

1. **基本テーブルの作成**
   - Supabaseダッシュボード → SQL Editor
   - `database/supabase/migrations/02_database_setup.sql` を実行
   - `docs/deployment/08_supabase_setup_guide.md` で確認

2. **予約変更ポリシー**（必須）
   - `database/supabase/migrations/03_reservations_update_policy.sql` を実行

3. **マイページ用**（オプション）
   - `database/supabase/migrations/04_database_update_for_mypage.sql` を実行

4. **コート2面対応**（必須）
   - `database/supabase/migrations/05_database_update_for_courts.sql` を実行
   - `design/database/15_court_update_execution_guide.md` で手順参照

### 2. Vercelデプロイ

1. **GitHubリポジトリの準備**
   - `app`フォルダーをGitHubリポジトリにプッシュ
   - `docs/deployment/06_vercel_deployment_guide.md`に従ってデプロイ

2. **環境変数の設定**
   - `docs/deployment/07_vercel_env_variables.md`で環境変数を設定
   - 必要な環境変数：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL`（VercelのデプロイURL）

3. **Vercel設定**
   - tennis-court-reservation-app をデプロイする場合: Root Directory は**空**（`docs/deployment/06_vercel_deployment_guide.md` 参照）
   - Framework: Next.js（自動検出）

### 3. Supabase認証設定

1. Supabaseダッシュボード → Authentication → URL Configuration
2. Site URLとRedirect URLsをVercelの本番URLに設定
3. `docs/deployment/06_vercel_deployment_guide.md`のStep 7を参照

---

## 📚 ドキュメント

詳細は `docs/README.md` を参照してください。

---

## ✨ 主な機能

### 基本機能
- ✅ 完全無料サービス（支払い機能なし）
- ✅ 会員登録・ログイン（Supabase Auth）
- ✅ 予約カレンダー（9:00-17:00、土日祝のみ）
- ✅ 1日最大2時間制限（コートごと）
- ✅ 予約履歴・キャンセル機能
- ✅ 前日までキャンセル可能

### コート管理
- ✅ コート2面対応（コートA・コートB）
- ✅ コート選択機能
- ✅ コートごとの予約管理
- ✅ コートごとの空き状況表示

### マイページ機能
- ✅ プロフィール確認・編集
- ✅ 予約状況の表示
- ✅ 予約の変更・キャンセル
- ✅ 予約履歴のフィルター機能

### メール通知
- ✅ 新規登録時のメール認証（Supabase Auth）
- ✅ パスワードリセット（Supabase Auth）

---

## 🛠️ 技術スタック

- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS + Material Design 3
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel
- **Language**: TypeScript

---

## 📝 開発手順

### ローカル開発

```bash
cd app
npm install
npm run dev
```

http://localhost:3000 でアプリが起動します。

### デプロイ

```bash
cd app
git add .
git commit -m "更新内容"
git push origin main
```

Vercelが自動的に再デプロイします。

---

*最終更新: 2025年1月*
