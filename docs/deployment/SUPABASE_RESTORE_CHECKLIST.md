# Supabase 復元チェックリスト

> **目的：** Supabase プロジェクトの復元状況を確認し、未復元の項目をすべて復元する

**本番 URL**: `https://tennis-court-reservation-app.vercel.app`

---

## Phase 1: 現状確認（検証用 SQL）

Supabase ダッシュボード → **SQL Editor** で以下を実行し、結果を確認する。

### 1.1 テーブル存在確認

```sql
-- 必須テーブルが存在するか
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'courts', 'reservations', 'audit_logs')
ORDER BY table_name;
```

**期待結果**: 4 行（audit_logs, courts, profiles, reservations）

### 1.2 profiles のカラム確認（phone なしであること）

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
```

**期待結果**: id, full_name, full_name_kana, email, created_at, updated_at（**phone が含まれていないこと**）

### 1.3 必須 RLS ポリシー確認

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'reservations', 'courts', 'audit_logs')
ORDER BY tablename, policyname;
```

**期待結果**: 各テーブルに必要なポリシーが存在すること（詳細は下記 Phase 2 参照）

### 1.4 トリガー・関数確認

```sql
-- トリガー
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgrelid IN ('public.profiles'::regclass, 'auth.users'::regclass, 'public.reservations'::regclass)
  AND NOT tgisinternal;

-- 関数
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'check_daily_limit', 'log_reservation_changes', 'create_missing_profiles');
```

**期待結果**:
- トリガー: `on_auth_user_created` (auth.users), `check_daily_limit_trigger`, `audit_reservation_changes` (reservations)
- 関数: 4 つすべて存在

### 1.5 VIEW 確認

```sql
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public' AND table_name = 'public_availability';
```

**期待結果**: 1 行（public_availability）

---

## Phase 2: データベース復元

上記確認で**不足がある場合**、以下を実行する。

### 方法A: PowerShell スクリプト（推奨・Node.js 不要）

```powershell
cd tennis-reservation
$env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"   # https://supabase.com/dashboard/account/tokens で取得
.\database\scripts\verify-and-restore.ps1
```
- テーブル数を検証し、4つ未満なら自動で `00_full_setup_fresh.sql` を実行

### 方法B: 手動（SQL Editor）

**2.1 完全新規の場合**（テーブルが 0 の状態）

`database/supabase/00_full_setup_fresh.sql` を **SQL Editor** に貼り付けて実行。

### 2.2 既存 DB に不足がある場合

実行順序で以下のマイグレーションを適用：

| 順 | ファイル | 内容 |
|----|---------|------|
| 1 | `migrations/02_database_setup.sql` | 基本テーブル（※courts なし、phone あり） |
| 2 | `migrations/03_reservations_update_policy.sql` | 予約 UPDATE ポリシー |
| 3 | `migrations/04_database_update_for_mypage.sql` | マイページ用カラム |
| 4 | `migrations/05_database_update_for_courts.sql` | courts テーブル、court_id |
| 5 | `migrations/16_security_improvements.sql` | public_availability VIEW、RLS 改善 |
| 6 | `migrations/17_additional_security.sql` | 監査ログ、UPDATE ポリシー |
| 7 | `migrations/18_drop_phone_from_profiles.sql` | phone カラム削除 |

**注意**: 既に 00_full_setup_fresh 相当の状態であれば、不足している migration のみ実行。

### 2.3 プロフィール修復（auth.users に profile がない場合）

```sql
SELECT * FROM public.create_missing_profiles();
```

---

## Phase 3: 認証設定（Authentication）

Supabase ダッシュボード → **Authentication** で確認・設定する。

### 3.1 Providers

- [ ] **Email** が有効
- [ ] **Confirm email** が有効（新規登録時にメール認証必須）

### 3.2 URL Configuration

| 項目 | 設定値 |
|------|--------|
| **Site URL** | `https://tennis-court-reservation-app.vercel.app` |
| **Redirect URLs** | 以下を追加（ワイルドカードで含まれる場合は `/**` のみでも可） |
| | `https://tennis-court-reservation-app.vercel.app/**` |
| | `https://tennis-court-reservation-app.vercel.app/login` |
| | `http://localhost:3000/**`（開発用） |

---

## Phase 4: メールテンプレート復元

Supabase ダッシュボード → **Authentication** → **Email Templates** で設定する。

**重要**: 変数は `{{.ConfirmationURL}}` のように**ドット付き・大文字小文字正確**に記述する。`{{CONFIRMATION_LINK}}` は動作しない。

### 4.1 Confirm signup（新規登録メール認証）

- **Subject**:
```
【iParkテニスコート予約システム】 メールアドレスの確認をお願いします
```

- **Body**: `docs/deployment/supabase_email_templates/01_confirm_signup.html` の内容をコピー＆ペースト

### 4.2 Reset password（パスワードリセット）

- **Subject**:
```
【iParkテニスコート予約システム】 パスワードリセットのご案内
```

- **Body**: `docs/deployment/supabase_email_templates/02_reset_password.html` の内容をコピー＆ペースト

### 4.3 Change email address（メールアドレス変更）

- **Subject**:
```
【iParkテニスコート予約システム】 メールアドレス変更の確認をお願いします
```

- **Body**: `docs/deployment/supabase_email_templates/03_change_email.html` の内容をコピー＆ペースト

---

## Phase 5: 動作確認

### 5.1 新規登録メール認証

1. テスト用メールアドレスで新規登録
2. 届いたメールの件名・本文が日本語カスタムテンプレートか確認
3. 認証リンクをクリック → ログイン画面に遷移するか確認

### 5.2 パスワードリセット

1. ログイン画面で「パスワードを忘れた場合」→ メールアドレス入力
2. 届いたメールの件名・本文を確認
3. リセットリンクで新パスワード設定できるか確認

### 5.3 メールアドレス変更（会員ログイン後）

1. マイページ → プロフィールでメールアドレス変更をリクエスト
2. 新しいメールアドレスに確認メールが届くか確認
3. リンクをクリックして変更が完了するか確認

---

## 参照ドキュメント

- メールテンプレート詳細: `docs/app/11_supabase_email_template_setup.md`
- トラブルシュート: `docs/app/22_supabase_email_template_troubleshooting.md`
- メールアドレス変更: `docs/app/23_supabase_email_change_template_setup.md`
