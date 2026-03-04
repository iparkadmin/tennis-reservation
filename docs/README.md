# テニスコート予約システム - ドキュメント一覧

## 📚 ドキュメント構成

## 📚 ドキュメント構成

### 事業要件定義書

- **[business/01_requirements_specification.md](./business/01_requirements_specification.md)**
  - システム全体の要件定義書
  - ビジネス要件、機能要件、技術設計、開発ロードマップ

- **[business/02_requirements_revision_free_service.md](./business/02_requirements_revision_free_service.md)**
  - 無料サービス版の詳細要件定義書
  - サイト構造、ユーザーフロー、データベース設計（改訂版）

### アプリケーション関連ドキュメント

- **[app/00_SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md](./app/00_SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md)**  
  - **新規SQL作成時は必ず適用:** 共通プロンプト `docs/app/SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md` への参照と、本プロジェクト用【アプリ要件】例
  - DDL/DML/RLS/Index/Function/Trigger 作成前に、共通プロンプトに【アプリ要件】を埋めて AI に渡してから設計・SQL を作る

- **[app/09_mypage_requirements.md](./app/09_mypage_requirements.md)**
  - マイページ機能の要件定義
  - プロフィール編集、予約管理機能の詳細

- **[app/31_utilization_records_requirements.md](./app/31_utilization_records_requirements.md)**
  - 利用者実績記録機能の要件定義
  - 利用有無・マナー状況の記録、四半期レビュー、見える化まで

- **[app/10_email_notification_list.md](./app/10_email_notification_list.md)**
  - 自動送付メールの完全なリスト
  - メール種類、送信タイミング、実装状況、優先度
  - **実装済み：認証関連メール（Supabase Auth）のみ**

- **[app/11_supabase_email_template_setup.md](./app/11_supabase_email_template_setup.md)**
  - Supabase Authのメールテンプレート設定ガイド
  - 新規登録・パスワードリセットメールの設定手順

- **[app/18_rate_limiting_guide.md](./app/18_rate_limiting_guide.md)**
  - レート制限実装ガイド

- **[app/20_service_role_key_setup.md](./app/20_service_role_key_setup.md)**
  - Supabase service_role キーの設定ガイド

- **[app/22_supabase_email_template_troubleshooting.md](./app/22_supabase_email_template_troubleshooting.md)**
  - メールテンプレートのトラブルシューティング

- **[app/23_supabase_email_change_template_setup.md](./app/23_supabase_email_change_template_setup.md)**
  - メールアドレス変更テンプレート設定ガイド

- **[app/SECURITY_AUDIT_REPORT.md](./app/SECURITY_AUDIT_REPORT.md)**
  - セキュリティ監査レポート

- **[app/SECURITY_EXPLANATION_FOR_AUDITORS.md](./app/SECURITY_EXPLANATION_FOR_AUDITORS.md)**
  - 監査者向けセキュリティ説明書

### この PC 向けセットアップ

- **[setup/SUPABASE_SQL_POWERSHELL_THIS_PC.md](./setup/SUPABASE_SQL_POWERSHELL_THIS_PC.md)**
  - Node.js が使えない PC 向け。PowerShell で Supabase Management API を呼び出して SQL を実行する手順

### デプロイ・セットアップガイド

- **[deployment/06_vercel_deployment_guide.md](./deployment/06_vercel_deployment_guide.md)**
  - Vercelへのデプロイ手順（詳細版）
  - GitHub連携、環境変数設定、デプロイ後の確認

- **[deployment/07_vercel_env_variables.md](./deployment/07_vercel_env_variables.md)**
  - Vercelの環境変数設定に特化したガイド
  - `supabaseUrl is required`エラーの解決方法

- **[deployment/08_supabase_setup_guide.md](./deployment/08_supabase_setup_guide.md)**
  - Supabaseデータベースのセットアップガイド
  - SQL実行手順、テーブル確認、RLSポリシー確認

- **[deployment/12_supabase_custom_smtp_setup.md](./deployment/12_supabase_custom_smtp_setup.md)**
  - Supabase カスタムSMTP設定ガイド
  - Mailgun/SMTP2GO/Resendを使用した送信元カスタマイズ手順

- **[deployment/13_smtp2go_setup_guide.md](./deployment/13_smtp2go_setup_guide.md)**
  - SMTP2GO専用の詳細設定ガイド
  - 永続的に無料で使用可能（月1,000通まで）

- **[deployment/14_resend_smtp_setup_guide.md](./deployment/14_resend_smtp_setup_guide.md)**
  - Resend専用の詳細設定ガイド（推奨）
  - DNS設定不要、設定が簡単（月3,000通まで無料）

- **[deployment/GIT_VERCEL_DEPLOY.md](./deployment/GIT_VERCEL_DEPLOY.md)** / **[VERCEL_DEPLOY_STEPS.md](./deployment/VERCEL_DEPLOY_STEPS.md)**
  - 即座にVercelにデプロイするためのクイックガイド

- **[deployment/ENVIRONMENT_WORKFLOW_RULE.md](./deployment/ENVIRONMENT_WORKFLOW_RULE.md)** ※AI・開発者向け
  - 元環境・コピー環境の作業対象ルール
  - 通常はコピー環境を更新、元環境は明示的に指定

- **[deployment/VERCEL_IMPORT_SETUP.md](./deployment/VERCEL_IMPORT_SETUP.md)**
  - 単独リポジトリでの Vercel インポート・デプロイ設定

- **[deployment/ENVIRONMENT_MIGRATION_CHECKLIST.md](./deployment/ENVIRONMENT_MIGRATION_CHECKLIST.md)**
  - 環境1→環境2 完全引越しチェックリスト

- **[deployment/15_supabase_keep_alive_setup.md](./deployment/15_supabase_keep_alive_setup.md)**
  - Supabase 無料プランのポーズ防止（Keep Alive）セットアップ
  - GitHub Actions で週2回 DB へ ping を送り、7日間のアクティビティ維持

---

## 🗄️ データベース関連

### マイグレーションファイル

データベースのマイグレーションファイルは `../database/supabase/migrations/` にあります：

- `02_database_setup.sql` - 基本テーブル、RLSポリシー、トリガー、関数の作成
- `03_reservations_update_policy.sql` - 予約変更（UPDATE）用 RLS ポリシー
- `04_database_update_for_mypage.sql` - マイページ機能対応のためのデータベース更新SQL
- `05_database_update_for_courts.sql` - コート2面対応のデータベース更新SQL
- `16_security_improvements.sql` - セキュリティ改善SQL（重要）
- `17_additional_security.sql` - 追加セキュリティ対策SQL

### データベーススクリプト

データベーススクリプトは `../database/scripts/` にあります：

- `19_admin_queries.sql` - 管理者向けクエリ

---

## 🎨 設計書類

### データベース設計

- **[../design/database/15_court_update_execution_guide.md](../design/database/15_court_update_execution_guide.md)**
  - コート2面対応SQLの実行手順ガイド
  - SupabaseダッシュボードでのSQL実行方法を詳しく説明

17b. **17b_audit_all_tables.sql**（未作成）
    - 全テーブル（reservations / profiles / courts）の DML と DDL を audit_logs に記録（17 のあとに実行想定）

18. **[18_rate_limiting_guide.md](./18_rate_limiting_guide.md)**
    - レート制限実装ガイド
    - スパム攻撃・DoS攻撃対策
    - Vercel Middleware + Upstash Redis での実装方法

### 運用・管理者向け

19. **[19_admin_queries.sql](./19_admin_queries.sql)**
    - 管理者向け SQL（Supabase SQL Editor で実行）
    - ユーザーID 一覧、profiles／auth.users 突き合わせ、予約に紐づく user_id など

---

## 🚀 クイックスタート

### 1. データベースセットアップ

0. **新規SQLを作る場合**  
   - まず `docs/app/SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md`（vault 共通）のプロンプトに、`00_SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md` の【アプリ要件】例を埋めて AI で設計・SQL を生成し、`02_database_setup.sql` 等に反映する。

1. **基本テーブルの作成**
   - `02_database_setup.sql`をSupabaseのSQL Editorで実行
   - `08_supabase_setup_guide.md`で確認手順を参照

2. **予約変更ポリシーの追加**（必須）
   - `03_reservations_update_policy.sql`を実行（予約変更に必要）

3. **マイページ機能の追加**（オプション）
   - `04_database_update_for_mypage.sql`を実行

4. **コート2面対応の追加**（必須）
   - `05_database_update_for_courts.sql`を実行
   - `15_court_update_execution_guide.md`で実行手順を参照

4. **セキュリティ改善の適用**（必須・重要）⭐
   - `16_security_improvements.sql`を実行（個人情報保護）
   - `16b_public_availability_rpc.sql`を実行（未作成の場合はスキップ。カレンダーで全予約済み枠を正しく表示する用）
   - `17_additional_security.sql`を実行（監査ログ・予約変更機能）

### 2. Vercelデプロイ

1. **GitHubリポジトリの準備**
   - `tennis-app`フォルダーをGitHubリポジトリにプッシュ
   - `06_vercel_deployment_guide.md`に従ってデプロイ

2. **環境変数の設定**
   - `07_vercel_env_variables.md`で環境変数を設定
   - 必要な環境変数：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL`（VercelのデプロイURL）

3. **Vercel設定**
   - **Root Directory**: 空のまま（tennis-court-reservation-app の場合。詳細は `06_vercel_deployment_guide.md`）
   - Framework: Next.js（自動検出）

### 3. Supabase認証設定

1. Supabaseダッシュボード → Authentication → URL Configuration
2. Site URLとRedirect URLsをVercelの本番URLに設定
3. `06_vercel_deployment_guide.md`のStep 7を参照

### 4. メールテンプレート設定（オプション）

1. `11_supabase_email_template_setup.md`に従ってメールテンプレートを設定
2. `12_supabase_custom_smtp_setup.md`に従ってカスタムSMTPを設定（推奨：Resend）

---

## 📝 ドキュメントの更新履歴

- **2026年1月**: セキュリティ改善（RLSポリシー、監査ログ、レート制限）⭐
- **2026年1月**: ゲスト予約機能の削除（会員限定サービスに変更）
- **2025年1月**: 無料サービス版への要件変更、支払い関連機能の除外
- **2025年1月**: サイト構造の再整理、ゲスト予約フローの追加
- **2025年1月**: マイページ機能の追加
- **2025年1月**: コート2面対応の実装
- **2025年1月**: メール機能は認証関連のみ実装（Supabase Auth）

---

## ✨ 実装済み機能

### 認証機能
- ✅ 新規登録（メール認証対応）
- ✅ ログイン
- ✅ パスワードリセット

### 予約機能
- ✅ コート選択（コートA・コートB）
- ✅ 予約カレンダー表示（週表示）
- ✅ 時間枠選択（9:00-17:00、1時間単位）
- ✅ 土日祝のみ予約可能
- ✅ 1日最大2時間制限（コートごと）

### マイページ機能
- ✅ プロフィール確認・編集
- ✅ 予約履歴表示
- ✅ 予約詳細表示
- ✅ 予約変更・キャンセル（前日まで）

### メール通知
- ✅ 新規登録時のメール認証（Supabase Auth）
- ✅ パスワードリセットメール（Supabase Auth）

---

*最終更新: 2025年1月*
