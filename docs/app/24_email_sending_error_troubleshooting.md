# 認証メール送信エラーのトラブルシューティング

## エラーメッセージ
「認証メールの送信に失敗しました。Supabaseのメール設定を確認してください。」

このエラーが表示される場合、Supabaseのメール設定に問題がある可能性があります。

---

## 🔍 確認手順

### Step 1: Supabaseダッシュボードでメール設定を確認

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard
   - プロジェクト「tennis court reservation」を選択

2. **Authentication → Email を確認**
   - 左メニュー → **Authentication** → **Email**
   - **「Enable email confirmations」** が **ON** になっているか確認
   - **「Enable custom SMTP」** を使用している場合、設定を確認

### Step 2: メールテンプレートの確認

1. **Authentication → Email Templates を確認**
   - **「Confirm sign up」** テンプレートを選択
   - **Subject** と **Body** の両方に内容が入力されているか確認
   - **重要**: HTML本文内に `{{.ConfirmationURL}}` が正しく設定されているか確認
     - ✅ 正しい: `<a href="{{.ConfirmationURL}}">メールアドレスを確認する</a>`
     - ❌ 間違い: `{{CONFIRMATION_LINK}}` や `{{ConfirmationURL}}`（ドットなし）

2. **テンプレートを保存**
   - 「Save changes」ボタンをクリックして保存

### Step 3: カスタムSMTPを使用している場合の確認

**カスタムSMTPを有効にしている場合:**

1. **Settings → Auth → SMTP Settings を確認**
   - **Enable Custom SMTP** が **ON** になっているか確認
   - 以下の設定を確認：
     - **Host**: 正しいSMTPサーバー名（例: `smtp.resend.com`）
     - **Port**: `587` または `465`
     - **Username**: 正しいユーザー名（Resendの場合は `resend`）
     - **Password**: 正しいAPI Keyまたはパスワード
     - **Sender email**: 認証済みのメールアドレス
     - **Sender name**: 送信者名

2. **SMTP接続テスト**
   - 設定を保存すると、Supabaseが自動的にSMTP接続をテストします
   - エラーが表示される場合、設定を再確認してください

### Step 4: デフォルトメール送信を使用している場合

**カスタムSMTPを無効にしている場合:**

1. **Supabaseのデフォルトメール送信を使用**
   - デフォルトでは、Supabaseは `noreply@mail.app.supabase.io` からメールを送信します
   - メール送信制限がある場合があります（無料プランの場合）

2. **メール送信制限の確認**
   - Supabaseダッシュボード → **Settings** → **Usage** でメール送信数の制限を確認
   - 制限に達している場合、カスタムSMTPの設定を検討してください

---

## 🛠️ よくある問題と解決方法

### 問題1: カスタムSMTPの接続エラー

**症状**: SMTP接続が失敗する

**対処法**:
1. **Host名を確認**
   - Resend: `smtp.resend.com`
   - SMTP2GO: `mail.smtp2go.com`
   - Office 365: `smtp.office365.com`
   - その他のサービス: 正しいSMTPサーバー名を確認

2. **Port番号を確認**
   - `587`（STARTTLS/TLS）または `465`（SSL）を試す
   - 両方を試してみる

3. **認証情報を確認**
   - Username/Password（API Key）が正しいか確認
   - サービス側でAPI Keyが有効か確認

4. **Office 365を使用している場合の特別な注意事項**
   - **多要素認証（MFA）が有効な場合、通常のパスワードでは認証できません**
   - **アプリパスワード（App Password）を使用する必要があります**
   - アプリパスワードの作成方法：
     1. Microsoft 365管理センターにログイン
     2. セキュリティ設定 → アプリパスワード
     3. 新しいアプリパスワードを生成
     4. 生成されたパスワードをSupabaseのSMTP設定の「Password」フィールドに設定
   - **送信元メールアドレスとSMTPユーザー名の関係**
     - 送信元メールアドレス（`tennis@iparkinstitute.com`）が、SMTPユーザー名（`tatsuhito.muramatsu@iparkinstitute.com`）と同じアカウントまたは共有メールボックスである必要があります
     - または、送信元メールアドレスに対して送信権限が付与されている必要があります

### 問題2: メールテンプレートが正しく設定されていない

**症状**: メールが送信されない、またはデフォルトメールが送信される

**対処法**:
1. **トークン名を確認**
   - `{{.ConfirmationURL}}`（ドット付き、大文字小文字正確）を使用
   - `{{CONFIRMATION_LINK}}` などの間違った形式を使っていないか確認

2. **HTML本文内にリンクが含まれているか確認**
   - `<a href="{{.ConfirmationURL}}">` がHTML本文内に含まれている必要があります

3. **テンプレートを保存**
   - 「Save changes」ボタンをクリックして保存

### 問題3: メール送信制限に達している

**症状**: メールが送信されない（特に無料プランの場合）

**対処法**:
1. **Supabaseの使用状況を確認**
   - Settings → Usage でメール送信数を確認
   - 制限に達している場合、カスタムSMTPの設定を検討

2. **カスタムSMTPを設定**
   - Resend、SMTP2GOなどの無料SMTPサービスを使用
   - 詳細は `docs/deployment/12_supabase_custom_smtp_setup.md` を参照

---

## 📋 チェックリスト

以下の項目を順番に確認してください：

- [ ] Supabaseダッシュボードで「Enable email confirmations」がONになっている
- [ ] メールテンプレート（Confirm sign up）が正しく設定されている
- [ ] HTML本文内に `{{.ConfirmationURL}}` が正しく設定されている
- [ ] テンプレートを保存している（「Save changes」をクリック）
- [ ] カスタムSMTPを使用している場合、設定が正しい
- [ ] SMTP接続テストが成功している
- [ ] メール送信制限に達していない
- [ ] ブラウザのコンソールでエラーログを確認（`[認証メール再送信]` で始まるログ）

---

## 🔗 関連ドキュメント

- **メールテンプレート設定**: `docs/app/21_supabase_email_template_setup.md`
- **トラブルシューティング**: `docs/app/22_supabase_email_template_troubleshooting.md`
- **カスタムSMTP設定**: `docs/deployment/12_supabase_custom_smtp_setup.md`
- **Resend SMTP設定**: `docs/deployment/14_resend_smtp_setup_guide.md`
- **SMTP2GO設定**: `docs/deployment/13_smtp2go_setup_guide.md`

---

*最終更新: 2025年1月*
