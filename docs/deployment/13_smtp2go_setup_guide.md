# SMTP2GO 設定ガイド

> **目的：** SMTP2GOを使用してSupabase Authのメールをカスタムドメイン（iPark Institute Co., Ltd.）から送信する

---

## 📧 SMTP2GOの特徴

- **無料枠：** 月1,000通まで（永続的、クレジットカード不要）
- **有料プラン：** 月$10から（月10,000通）
- **特徴：**
  - 永続的に無料で使用可能
  - クレジットカード不要で登録可能
  - 設定が簡単
  - トランザクションメールに最適
  - 高い配信率
  - 詳細な送信ログ

---

## 🔧 設定手順

### Step 1: SMTP2GOアカウントの作成

#### 1.1 アカウント登録

1. https://www.smtp2go.com にアクセス
2. **Sign Up Free** をクリック
3. 以下の情報を入力：
   - **Email:** メールアドレス
   - **Password:** パスワード（8文字以上）
   - **Company Name:** `iPark Institute Co., Ltd.`
4. **Create Account** をクリック
5. メール認証を完了（登録したメールアドレスに認証メールが届きます）

#### 1.2 ダッシュボードにログイン

1. https://app.smtp2go.com にアクセス
2. 登録したメールアドレスとパスワードでログイン

---

### Step 2: SMTPユーザーの作成

#### 2.1 SMTPユーザー設定画面を開く

1. SMTP2GOダッシュボードにログイン
2. 左メニューから **Sending** → **SMTP Users** を選択

**注意：** 「Settings」ではなく「**Sending**」メニューから「SMTP Users」を選択してください。

#### 2.2 SMTPユーザーを作成

1. **Add SMTP User** をクリック
2. 以下の情報を入力：
   - **Username:** `supabase-smtp`（任意のユーザー名）
   - **Password:** 強力なパスワードを設定（自動生成も可能）
   - **Description:** `Supabase Auth用SMTP`
3. **Create User** をクリック
4. **Username** と **Password** をコピー（後で使用します）

**重要：** Passwordはこの画面でしか表示されないため、必ずコピーして安全な場所に保存してください。

---

### Step 3: 送信元メールアドレスの認証

#### 3.1 送信元メールアドレスを追加

1. 左メニューから **Sending** → **Verified Senders** を選択

**注意：** 「Senders」ではなく「**Verified Senders**」という名称です。

2. **Add Sender** をクリック
3. 以下の情報を入力：
   - **Email Address:** `noreply@ipark-institute.com`
   - **Display Name:** `iPark Institute Co., Ltd.`
   - **Reply To:** `support@ipark-institute.com`（オプション）
4. **Add Sender** をクリック

#### 3.2 メール認証またはDNS認証

SMTP2GOでは、以下の2つの方法で送信元を認証できます：

##### 方法A: メール認証（簡単・推奨）

1. `noreply@ipark-institute.com` に認証メールが届きます
2. メール内の **Verify Email Address** リンクをクリック
3. 認証が完了すると、送信元メールアドレスが認証済みとして表示されます

**注意：** 
- 認証メールが届かない場合は、スパムフォルダを確認してください
- 認証が完了するまで、そのメールアドレスから送信できません

##### 方法B: DNS認証（ドメイン全体を認証）

1. **Verified Senders** ページで、**DNS configuration** タブを選択
2. 表示されるCNAMEレコードをコピー
3. ドメインのDNSプロバイダー（例：Microsoft Corporation）で以下のCNAMEレコードを追加：

**必要なCNAMEレコード：**

| タイプ | ホスト名 | 値（Content） |
|--------|---------|--------------|
| CNAME | `em939107`（例） | `return.smtp2go.net` |
| CNAME | `s939107._domainkey`（例） | `dkim.smtp2go.net` |
| CNAME | `link` | `track.smtp2go.net` |

**注意：** ホスト名の数値部分（`em939107`、`s939107`）は、SMTP2GOが提供する実際の値を使用してください。

4. DNSレコードを追加後、数分〜1時間待つ（DNSの反映に時間がかかる場合があります）
5. SMTP2GOの **Verified Senders** ページで **Verify** ボタンをクリック
6. すべてのCNAMEレコードが正しく設定されていれば、認証が完了します

**DNS設定の確認：**
- 「Current value」が「No record found」から実際の値に変わるまで待つ
- すべてのレコードが正しく設定されていることを確認してから **Verify** をクリック

---

### Step 4: SupabaseでカスタムSMTPを設定

#### 4.1 Supabaseダッシュボードにアクセス

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択（tennis court reservation）
3. 左メニューから **Settings** → **Auth** を選択

#### 4.2 SMTP設定を開く

1. **Auth** 設定画面をスクロール
2. **SMTP Settings** セクションを探す
3. **Enable Custom SMTP** のトグルを **ON** に設定

#### 4.3 SMTP情報を入力

以下の情報を入力します：

| 項目 | 値 |
|------|-----|
| **Host** | `mail.smtp2go.com` |
| **Port** | `587`（TLS推奨）または `465`（SSL） |
| **Username** | Step 2.2で作成したSMTPユーザー名（例：`supabase-smtp`） |
| **Password** | Step 2.2で作成したSMTPパスワード |
| **Sender email** | `noreply@ipark-institute.com`（Step 3で認証済みのメールアドレス） |
| **Sender name** | `iPark Institute Co., Ltd.` |

#### 4.4 設定を保存

1. すべての情報を入力したら、**Save** をクリック
2. SupabaseがSMTP接続をテストします
3. 成功メッセージが表示されれば設定完了

**エラーが表示された場合：**
- Host名が正しいか確認（`mail.smtp2go.com`）
- Port番号を確認（`587` または `465`）
- Username/Passwordが正しいか確認
- 送信元メールアドレスが認証済みか確認

---

## ✅ 設定確認

### テスト方法

1. **新規登録時のメール認証をテスト**
   - テスト用のメールアドレスで新規登録を実行
   - メールが届くことを確認
   - 送信元が `iPark Institute Co., Ltd. <noreply@ipark-institute.com>` になっているか確認

2. **パスワードリセットメールをテスト**
   - ログイン画面で「パスワードを忘れた場合」をクリック
   - テスト用のメールアドレスを入力
   - メールが届くことを確認
   - 送信元を確認

### SMTP2GOダッシュボードで送信ログを確認

1. SMTP2GOダッシュボードにログイン
2. 左メニューから **Statistics** → **Email Logs** を選択（または **Reports** → **Email Logs**）

**注意：** SMTP2GOのバージョンによって、メニューの場所が異なる場合があります。
3. 送信されたメールの一覧が表示されます
4. 各メールの送信状況（成功、失敗、バウンス等）を確認できます

---

## 🔍 トラブルシューティング

### SMTP接続エラー

**エラー：** `SMTP connection failed`

**対処法：**
1. **Host名を確認**
   - 正しいHost名：`mail.smtp2go.com`
   - タイポがないか確認

2. **Port番号を確認**
   - TLS: `587`
   - SSL: `465`
   - 両方を試してみる

3. **認証情報を確認**
   - Username/Passwordが正しいか確認
   - SMTP2GOダッシュボードでSMTPユーザーが正しく作成されているか確認

4. **送信元メールアドレスの認証を確認**
   - `noreply@ipark-institute.com` が認証済みか確認
   - 認証メール内のリンクをクリックして認証を完了

### メールが届かない

**対処法：**
1. **スパムフォルダを確認**
   - メールがスパムフォルダに振り分けられていないか確認

2. **送信ログを確認**
   - SMTP2GOダッシュボードの **Statistics** → **Email Logs**（または **Reports** → **Email Logs**）で送信ログを確認
   - エラーが発生していないか確認
   - バウンスやブロックされていないか確認

3. **レート制限を確認**
   - 無料枠の月1,000通の制限に達していないか確認
   - SMTP2GOダッシュボードの **Statistics**（または **Reports**）で送信数を確認
   - ダッシュボードのトップページにも送信数のサマリーが表示されます

4. **送信元メールアドレスの認証を確認**
   - 送信元メールアドレスが認証済みか確認
   - 認証が完了していない場合は、認証メール内のリンクをクリック

### 送信元が正しく表示されない

**対処法：**
1. **Sender emailとSender nameを確認**
   - SupabaseのSMTP設定で正しく入力されているか確認
   - 送信元メールアドレスがSMTP2GOで認証されているか確認

2. **メールクライアントの表示を確認**
   - メールクライアントによって表示が異なる場合があります
   - 複数のメールクライアント（Gmail、Outlook等）で確認

---

## 📊 SMTP2GOの無料枠について

### 無料枠の制限

- **送信数：** 月1,000通まで
- **送信元メールアドレス：** 2つまで
- **SMTPユーザー：** 1つまで
- **サポート：** コミュニティサポート

### 無料枠で十分な場合

以下のような用途であれば、無料枠で十分です：

- 新規登録時のメール認証（月100-200通程度）
- パスワードリセットメール（月50-100通程度）
- 合計：月150-300通程度

**注意：** 予約完了確認メール等の追加メールを実装する場合は、送信数が増えるため、有料プランへのアップグレードを検討してください。

### 有料プランへのアップグレード

月1,000通を超える場合は、以下のプランがあります：

- **Starter:** 月$10（月10,000通）
- **Professional:** 月$25（月50,000通）
- **Business:** 月$50（月100,000通）

---

## 🔐 セキュリティ注意事項

1. **SMTPパスワードの管理**
   - SMTPパスワードは機密情報として扱う
   - 定期的にパスワードを変更
   - 強力なパスワードを使用（12文字以上、大文字・小文字・数字・記号を含む）

2. **送信元メールアドレスの認証**
   - 必ず送信元メールアドレスを認証する
   - 未認証のメールアドレスから送信すると、スパムとして扱われる可能性が高い

3. **アカウントのセキュリティ**
   - SMTP2GOアカウントに2要素認証（2FA）を有効化（推奨）
   - 定期的にパスワードを変更

---

## 📚 参考リンク

- [SMTP2GO公式サイト](https://www.smtp2go.com)
- [SMTP2GO Documentation](https://www.smtp2go.com/docs/)
- [SMTP2GO SMTP Settings](https://www.smtp2go.com/setup-guide/)
- [Supabase SMTP Settings Documentation](https://supabase.com/docs/guides/auth/auth-smtp)

---

## 🎯 設定完了後の確認事項

1. ✅ SMTP2GOアカウントが作成されている
2. ✅ SMTPユーザーが作成されている
3. ✅ 送信元メールアドレス（`noreply@ipark-institute.com`）が認証されている
   - メール認証：認証メール内のリンクをクリック
   - DNS認証：DNSレコードを設定して **Verify** をクリック
4. ✅ SupabaseでカスタムSMTPが有効化されている
5. ✅ SMTP接続テストが成功している
6. ✅ テストメールが正常に送信されている
7. ✅ 送信元が `iPark Institute Co., Ltd. <noreply@ipark-institute.com>` になっている

---

## 📝 DNS認証の詳細手順

### DNSレコードの設定方法

#### Step 1: DNSプロバイダーにアクセス

1. ドメインのDNS管理画面にアクセス
   - Microsoft Corporation（Azure DNS）の場合：Azure Portal → DNS Zones
   - その他のプロバイダーの場合：該当するDNS管理画面

#### Step 2: CNAMEレコードを追加

SMTP2GOの **DNS configuration** タブに表示される3つのCNAMEレコードを追加します。

**例：**

1. **CNAMEレコード1**
   - **ホスト名（Name）：** `em939107`（SMTP2GOが提供する値）
   - **値（Value/Points to）：** `return.smtp2go.net`
   - **TTL：** 3600（デフォルト）

2. **CNAMEレコード2**
   - **ホスト名（Name）：** `s939107._domainkey`（SMTP2GOが提供する値）
   - **値（Value/Points to）：** `dkim.smtp2go.net`
   - **TTL：** 3600（デフォルト）

3. **CNAMEレコード3**
   - **ホスト名（Name）：** `link`
   - **値（Value/Points to）：** `track.smtp2go.net`
   - **TTL：** 3600（デフォルト）

#### Step 3: DNSの反映を待つ

1. DNSレコードを追加後、数分〜1時間待つ
2. SMTP2GOの **DNS configuration** タブで「Current value」を確認
3. 「No record found」から実際の値（例：`return.smtp2go.net`）に変わるまで待つ

#### Step 4: 認証を実行

1. すべてのCNAMEレコードの「Current value」が正しく表示されていることを確認
2. **Verify** ボタンをクリック
3. 認証が成功すると、ドメイン認証済みのマークが表示されます

**エラーが表示された場合：**
- DNSレコードが正しく設定されているか確認
- DNSの反映に時間がかかっている可能性があるため、しばらく待ってから再度 **Verify** をクリック
- DNSプロバイダーの設定画面で、レコードが正しく保存されているか確認

---

*最終更新: 2025年1月*
