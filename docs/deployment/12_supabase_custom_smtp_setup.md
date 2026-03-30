# Supabase カスタムSMTP設定ガイド

> **目的：** Supabase Authのメールをカスタムドメイン（iPark Institute Co., Ltd.）から送信するためのSMTP設定

---

## 📧 設定の目的

デフォルトでは、Supabase Authのメールは `noreply@mail.app.supabase.io` から送信されますが、カスタムSMTPを設定することで、以下のように変更できます：

- **送信元メールアドレス：** `noreply@ipark-institute.com`
- **送信元名：** `iPark Institute Co., Ltd.`

---

## 🔧 設定手順

### Step 1: SMTPサービスを選択

以下のいずれかの無料SMTPサービスを使用します：

#### 🥇 推奨：Resend（最も簡単・推奨）

- **URL：** https://resend.com
- **無料枠：** 月3,000通まで（1日100通まで、永続的）
- **有料プラン：** 月$20から（月50,000通）
- **特徴：**
  - **DNS設定不要**（メールアドレス認証のみで使用可能）
  - 設定が非常に簡単
  - モダンなAPI設計
  - ドキュメントが充実
  - React Emailとの統合が可能
  - 高い配信率
  - 詳細な送信ログ

#### 🥈 永続的に無料：SMTP2GO

- **URL：** https://www.smtp2go.com
- **無料枠：** 月1,000通まで（永続的、クレジットカード不要）
- **有料プラン：** 月$10から（月10,000通）
- **特徴：**
  - 永続的に無料で使用可能
  - クレジットカード不要
  - 設定が簡単
  - トランザクションメールに最適
  - 高い配信率

#### その他の選択肢

- **SendPulse** (https://sendpulse.com)
  - 無料枠：1日400通まで（月約12,000通相当）
  - 有料プラン：月$8から
  - 1日の制限があるため、大量送信には不向き

- **Amazon SES** (https://aws.amazon.com/ses/)
  - 無料枠：最初の12ヶ月間は月3,000通まで
  - 有料プラン：$0.10/1,000通
  - 高信頼性
  - AWSアカウントが必要
  - 設定がやや複雑

**注意：** SendGridは2025年7月に無料プランを終了しました。

---

### Step 2: SMTPサービスアカウントの作成と設定

#### オプションA: Mailgunを使用する場合

##### 2.1 Mailgunアカウント作成

1. https://www.mailgun.com にアクセス
2. **Sign Up** をクリック
3. アカウント情報を入力して登録
4. メール認証を完了

##### 2.2 SMTP認証情報の取得

1. Mailgunダッシュボードにログイン
2. 左メニューから **Sending** → **Domain Settings** を選択
3. デフォルトのサンドボックスドメイン（例：`sandbox12345.mailgun.org`）を使用するか、カスタムドメインを追加
4. **SMTP credentials** セクションを確認
5. **SMTP username** と **SMTP password** をコピー（または新規作成）

##### 2.3 送信元メールアドレスの認証

1. 左メニューから **Sending** → **Sending Domains** を選択
2. **Add New Domain** をクリック（カスタムドメインを使用する場合）
3. または、サンドボックスドメインを使用する場合は、送信元メールアドレスを `noreply@sandbox12345.mailgun.org` 形式で使用

**注意：** サンドボックスドメインは、認証済みのメールアドレスにのみ送信可能です。本番環境ではカスタムドメインの設定を推奨します。

#### オプションB: Resendを使用する場合（推奨）

##### 2.1 Resendアカウント作成

1. https://resend.com にアクセス
2. **Sign Up** をクリック
3. アカウント情報を入力して登録
4. メール認証を完了

##### 2.2 API Keyの作成

1. Resendダッシュボードにログイン
2. 左メニューから **API Keys** を選択
3. **Create API Key** をクリック
4. 以下の設定を入力：
   - **Name:** `Supabase SMTP`
   - **Permission:** **Sending access** を選択
5. **Add** をクリック
6. **API Keyをコピー**（この画面でしか表示されないため、必ずコピー）

##### 2.3 送信元メールアドレスの認証（DNS設定不要）

1. 左メニューから **Emails** → **Verified Emails** を選択
2. **Add Email** をクリック
3. 送信元メールアドレス（`noreply@ipark-institute.com`）を入力
4. **Add** をクリック
5. 認証メールが届くので、メール内のリンクをクリックして認証

**注意：** Resendでは、DNS設定なしでもメールアドレス認証のみで使用可能です。これが最も簡単な方法です。

#### オプションC: SMTP2GOを使用する場合

##### 2.1 SMTP2GOアカウント作成

1. https://www.smtp2go.com にアクセス
2. **Sign Up Free** をクリック
3. アカウント情報を入力して登録（クレジットカード不要）
4. メール認証を完了

##### 2.2 SMTP認証情報の取得

1. SMTP2GOダッシュボードにログイン
2. 左メニューから **Sending** → **SMTP Users** を選択
3. **Add SMTP User** をクリック
4. ユーザー名とパスワードを設定
5. **Username** と **Password** をコピー

**注意：** 「Settings」ではなく「**Sending**」メニューから「SMTP Users」を選択してください。

##### 2.3 送信元メールアドレスの設定

1. 左メニューから **Sending** → **Verified Senders** を選択
2. **Add Sender** をクリック
3. 送信元メールアドレス（`noreply@ipark-institute.com`）を入力
4. 認証メールが届くので、リンクをクリックして認証

**注意：** 「Senders」ではなく「**Verified Senders**」という名称です。

---

### Step 3: SupabaseでカスタムSMTPを設定

#### 3.1 Supabaseダッシュボードにアクセス

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択（tennis court reservation）
3. 左メニューから **Settings** → **Auth** を選択

#### 3.2 SMTP設定を開く

1. **Auth** 設定画面をスクロール
2. **SMTP Settings** セクションを探す
3. **Enable Custom SMTP** を有効化

#### 3.3 SMTP情報を入力

以下の情報を入力します：

**Resendの場合（推奨）：**

| 項目 | 値 |
|------|-----|
| **Host** | `smtp.resend.com` |
| **Port** | `587`（STARTTLS）または `465`（SSL） |
| **Username** | `resend`（固定） |
| **Password** | Resendで作成したAPI Key |
| **Sender email** | `noreply@ipark-institute.com`（認証済みのメールアドレス） |
| **Sender name** | `iPark Institute Co., Ltd.` |

**Mailgunの場合：**

| 項目 | 値 |
|------|-----|
| **Host** | `smtp.mailgun.org` |
| **Port** | `587`（TLS）または `465`（SSL） |
| **Username** | MailgunのSMTP認証情報のユーザー名 |
| **Password** | MailgunのSMTP認証情報のパスワード |
| **Sender email** | `noreply@ipark-institute.com`（カスタムドメイン）または `noreply@sandbox12345.mailgun.org`（サンドボックス） |
| **Sender name** | `iPark Institute Co., Ltd.` |

**SMTP2GOの場合：**

| 項目 | 値 |
|------|-----|
| **Host** | `mail.smtp2go.com` |
| **Port** | `587`（TLS）または `465`（SSL） |
| **Username** | SMTP2GOで作成したSMTPユーザー名 |
| **Password** | SMTP2GOで作成したSMTPパスワード |
| **Sender email** | `noreply@ipark-institute.com`（認証済みのメールアドレス） |
| **Sender name** | `iPark Institute Co., Ltd.` |

**SendPulseの場合：**

| 項目 | 値 |
|------|-----|
| **Host** | `smtp.sendpulse.com` |
| **Port** | `587`（TLS）または `465`（SSL） |
| **Username** | SendPulseのSMTPユーザー名 |
| **Password** | SendPulseのSMTPパスワード |
| **Sender email** | `noreply@ipark-institute.com` |
| **Sender name** | `iPark Institute Co., Ltd.` |

#### 3.4 設定を保存

1. すべての情報を入力したら、**Save** をクリック
2. SupabaseがSMTP接続をテストします
3. 成功メッセージが表示されれば設定完了

---

### Step 4: ドメイン認証の設定（オプション・推奨）

ドメイン認証を設定することで、より高い配信率とブランディングが可能になります。

#### 4.1 Mailgunでドメイン認証を設定

1. Mailgunダッシュボード → **Sending** → **Sending Domains**
2. **Add New Domain** をクリック
3. ドメイン名を入力（例：`ipark-institute.com`）
4. DNSレコードの設定指示が表示される

#### 4.2 DNSレコードの設定

ドメインのDNS設定で、Mailgunが提供する以下のレコードを追加：

**TXTレコード（SPF）：**
- `ipark-institute.com` → `v=spf1 include:mailgun.org ~all`

**TXTレコード（DKIM）：**
- `_domainkey.ipark-institute.com` → Mailgunが提供する値

**CNAMEレコード（DKIM）：**
- `email.ipark-institute.com` → `mailgun.org`

**MXレコード（オプション）：**
- メール受信も行う場合のみ設定

#### 4.3 認証の確認

1. DNSレコードを設定後、Mailgunで **Verify DNS Settings** をクリック
2. 認証が完了するまで数時間かかる場合があります
3. 認証が完了すると、ドメイン認証済みのマークが表示されます

#### 4.4 SMTP2GOでドメイン認証を設定

SMTP2GOでは、送信元メールアドレスの認証のみで使用可能です。ドメイン認証は有料プランで利用可能です。

---

## ✅ 設定確認

### テスト方法

1. **新規登録時のメール認証をテスト**
   - テスト用のメールアドレスで新規登録を実行
   - メールが届くことを確認
   - 送信元が `noreply@ipark-institute.com` になっているか確認
   - 送信元名が `iPark Institute Co., Ltd.` になっているか確認

2. **パスワードリセットメールをテスト**
   - ログイン画面で「パスワードを忘れた場合」をクリック
   - テスト用のメールアドレスを入力
   - メールが届くことを確認
   - 送信元を確認

### メールヘッダーの確認

受信したメールのヘッダーを確認して、以下を確認：

- **From:** `iPark Institute Co., Ltd. <noreply@ipark-institute.com>`
- **Reply-To:** `support@ipark-institute.com`（設定した場合）

---

## 🔍 トラブルシューティング

### SMTP接続エラー

**エラー：** `SMTP connection failed`

**対処法：**
1. **Host名を確認**
   - Mailgun: `smtp.mailgun.org`
   - SMTP2GO: `mail.smtp2go.com`
   - SendPulse: `smtp.sendpulse.com`

2. **Port番号を確認**
   - TLS: `587`
   - SSL: `465`
   - 両方を試してみる

3. **認証情報を確認**
   - Username/Passwordが正しいか確認
   - Mailgun/SMTP2GO/SendPulseのSMTP認証情報を使用

4. **ファイアウォール設定を確認**
   - SupabaseからSMTPサーバーへの接続が許可されているか確認

### メールが届かない

**対処法：**
1. **スパムフォルダを確認**
   - メールがスパムフォルダに振り分けられていないか確認

2. **送信元メールアドレスの認証を確認**
   - Mailgun/SMTP2GO/SendPulseで送信元メールアドレスが認証されているか確認
   - 認証メール内のリンクをクリックして認証を完了
   - Mailgunのサンドボックスドメインを使用する場合、受信先メールアドレスも認証が必要

3. **送信ログを確認**
   - Mailgun/SMTP2GO/SendPulseのダッシュボードで送信ログを確認
   - エラーが発生していないか確認

4. **レート制限を確認**
   - 無料枠の送信制限に達していないか確認

### 送信元が正しく表示されない

**対処法：**
1. **Sender emailとSender nameを確認**
   - SupabaseのSMTP設定で正しく入力されているか確認
   - 送信元メールアドレスがSMTPサービスで認証されているか確認

2. **メールクライアントの表示を確認**
   - メールクライアントによって表示が異なる場合があります
   - 複数のメールクライアントで確認

---

## 📊 SMTPサービスの比較（無料枠重視）

| サービス | 無料枠 | 有料プラン | 特徴 |
|---------|-------|-----------|------|
| **Resend** | 月3,000通（永続的、1日100通まで） | 月$20から | **DNS設定不要**、設定が簡単、推奨 |
| **Mailgun** | 月5,000通（最初の3ヶ月間のみ） | 月$35から | 無料枠が大きい、柔軟な設定 |
| **SMTP2GO** | 月1,000通（永続的） | 月$10から | 永続的に無料、クレジットカード不要 |
| **SendPulse** | 1日400通（月約12,000通相当） | 月$8から | 1日制限あり、大量送信には不向き |
| **Amazon SES** | 最初の12ヶ月間は月3,000通 | $0.10/1,000通 | 高信頼性、AWSアカウント必要 |

**推奨：**

- **🥇 最も簡単・推奨：** **Resend** を推奨
  - DNS設定不要（メールアドレス認証のみで使用可能）
  - 設定が非常に簡単
  - 無料枠が月3,000通と実用的
  - 永続的に無料で使用可能

- **初期段階（最初の3ヶ月間）：** **Mailgun** を検討（月5,000通まで無料、DNS設定が必要）
- **永続的に無料で使用（DNS設定不要）：** **Resend** を推奨（月3,000通まで永続的に無料）
- **大量送信が必要な場合：** **Amazon SES** を検討（低コスト、高信頼性）

**注意：** SendGridは2025年7月に無料プランを終了しました。

---

## 🔐 セキュリティ注意事項

1. **API Keyの管理**
   - API Keyは機密情報として扱う
   - 環境変数やシークレット管理サービスで管理
   - 定期的にローテーション

2. **送信元メールアドレスの認証**
   - 必ず送信元メールアドレスを認証する
   - 未認証のメールアドレスから送信すると、スパムとして扱われる可能性が高い

3. **DNSレコードの設定**
   - ドメイン認証を行う場合は、正しいDNSレコードを設定
   - SPF、DKIM、DMARCレコードを設定することで、より高い配信率を実現

---

## 📚 参考リンク

- [Supabase SMTP Settings Documentation](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend SMTP Documentation](https://resend.com/docs/send-with-smtp) - **推奨**
- [Resend Setup Guide](./14_resend_smtp_setup_guide.md) - **詳細ガイド**
- [Mailgun SMTP Documentation](https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp)
- [SMTP2GO Documentation](https://www.smtp2go.com/docs/)
- [SendPulse SMTP Documentation](https://sendpulse.com/knowledge-base/smtp)
- [Amazon SES SMTP Documentation](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)

---

## 🎯 次のステップ

カスタムSMTP設定が完了したら：

1. ✅ メールテンプレートを設定（`11_supabase_email_template_setup.md` を参照）
2. ✅ テストメールを送信して動作確認
3. ✅ 本番環境で使用開始

---

*最終更新: 2025年1月*
