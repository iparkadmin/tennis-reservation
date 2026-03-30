# Supabase メールテンプレート設定ガイド

> **目的：** Supabase Authのメール認証・パスワードリセットメールのテンプレートを設定する

**※ 本ガイドのテンプレート文面は、`10_email_notification_list.md` のメール文案に準拠しています。**

---

## 📧 設定対象メール

1. **新規登録時のメール認証**
2. **パスワードリセットメール**

これらはSupabase Authの標準機能により自動送信されますが、テンプレートをカスタマイズできます。

---

## 🔧 設定手順

### Step 1: Supabaseダッシュボードにアクセス

1. https://supabase.com/dashboard にログイン
2. プロジェクトを選択（tennis court reservation）
3. 左メニューから **Authentication** → **Email Templates** を選択

---

### Step 2: 新規登録時のメール認証テンプレート設定

#### 2.1 テンプレートを選択

**Email Templates** 画面で、以下のテンプレートを選択：

- **Confirm signup**（新規登録確認）

#### 2.2 テンプレート内容を設定

`10_email_notification_list.md` の「1. 新規登録時のメール認証」文案に準拠したHTMLです。  
以下のHTMLテンプレートをコピーして、Supabaseのテンプレートエディタに貼り付けます。

**重要：** `{{ .ConfirmationURL }}` はSupabaseの変数です。そのまま使用してください。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      この度は、テニスコート予約システムにご登録いただき、誠にありがとうございます。
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      ご登録いただいたメールアドレスを確認するため、以下のリンクをクリックしてください。
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #16145F; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        メールアドレスを確認する
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ 重要：</strong><br>
        このリンクは24時間有効です。24時間を過ぎた場合は、再度メール認証のリクエストを行ってください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      もし、このメールに心当たりがない場合は、このメールを無視してください。<br>
      リンクをクリックしない限り、アカウントは有効化されません。
    </p>
    
    <p style="font-size: 14px; color: #666;">
      リンクがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
      <span style="word-break: break-all; color: #0067B1;">{{ .ConfirmationURL }}</span>
    </p>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

#### 2.3 件名を設定

**Subject** フィールドに以下を入力：

```
【テニスコート予約システム】メールアドレスの確認をお願いします
```

#### 2.4 保存

**Save** ボタンをクリックして保存

---

### Step 3: パスワードリセットメールテンプレート設定

#### 3.1 テンプレートを選択

**Email Templates** 画面で、以下のテンプレートを選択：

- **Reset password**（パスワードリセット）

#### 3.2 テンプレート内容を設定

`10_email_notification_list.md` の「2. パスワードリセットメール」文案に準拠したHTMLです。  
以下のHTMLテンプレートをコピーして、Supabaseのテンプレートエディタに貼り付けます。

**重要：** `{{ .ConfirmationURL }}` はSupabaseの変数です。そのまま使用してください。

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      パスワードリセットのリクエストを受け付けました。
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      以下のリンクをクリックして、新しいパスワードを設定してください。
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #16145F; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        パスワードをリセットする
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ 重要：</strong><br>
        このリンクは1時間有効です。1時間を過ぎた場合は、再度パスワードリセットのリクエストを行ってください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      もし、このメールに心当たりがない場合は、このメールを無視してください。<br>
      リンクをクリックしない限り、パスワードは変更されません。
    </p>
    
    <p style="font-size: 14px; color: #666;">
      リンクがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
      <span style="word-break: break-all; color: #0067B1;">{{ .ConfirmationURL }}</span>
    </p>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

#### 3.3 件名を設定

**Subject** フィールドに以下を入力：

```
【テニスコート予約システム】パスワードリセットのご案内
```

#### 3.4 保存

**Save** ボタンをクリックして保存

---

## 📝 Supabaseテンプレート変数

Supabaseのメールテンプレートでは、以下の変数が使用できます：

| 変数 | 説明 | 使用可能なテンプレート |
|------|------|----------------------|
| `{{ .ConfirmationURL }}` | 認証・リセットリンクのURL | Confirm signup, Reset password |
| `{{ .Token }}` | 認証トークン（通常は使用しない） | Confirm signup, Reset password |
| `{{ .TokenHash }}` | トークンのハッシュ値（通常は使用しない） | Confirm signup, Reset password |
| `{{ .SiteURL }}` | サイトのURL | すべて |
| `{{ .Email }}` | ユーザーのメールアドレス | すべて |
| `{{ .RedirectTo }}` | リダイレクト先URL | Confirm signup, Reset password |

**注意：** `{{ .ConfirmationURL }}` を使用することを推奨します。この変数には、認証・リセットリンクが自動的に含まれます。

**URLの差し替え：** テンプレート内の `https://tennis-court-reservation.example.com` は、実際のアプリのURLに変更してください。`{{ .SiteURL }}` を使う場合は、`{{ .SiteURL }}/privacy-policy` のように記述できます。

**パスワードリセットのリダイレクト：** アプリでは `resetPasswordForEmail` の `redirectTo` に `/forgot-password` を指定しています。Supabase の **Authentication** → **URL Configuration** → **Redirect URLs** に `https://あなたのドメイン/forgot-password` が含まれるようにしてください（`/**` で含まれる場合は追加不要です）。

---

## ⚙️ 送信元設定

### 送信元メールアドレスの設定

1. Supabaseダッシュボード → **Settings** → **Auth**
2. **SMTP Settings** セクションを確認
3. デフォルトでは、Supabaseのメールアドレス（例：`noreply@mail.app.supabase.io`）から送信されます

### カスタムドメインの設定（オプション）

カスタムドメイン（例：`noreply@ipark-institute.com`）から送信する場合：

1. **Settings** → **Auth** → **SMTP Settings**
2. **Custom SMTP** を有効化
3. SMTPサーバーの設定を入力
   - **Host:** SMTPサーバーのホスト名
   - **Port:** SMTPポート（通常587または465）
   - **Username:** SMTPユーザー名
   - **Password:** SMTPパスワード
   - **Sender email:** 送信元メールアドレス（例：`noreply@ipark-institute.com`）
   - **Sender name:** 送信元名（例：`iPark Institute Co., Ltd.`）

**推奨SMTPサービス：**
- **SendGrid** - 無料枠あり、設定が簡単
- **Mailgun** - 柔軟な設定
- **Amazon SES** - 低コスト、高信頼性

---

## ✅ 設定確認

### テスト方法

1. **新規登録時のメール認証**
   - テスト用のメールアドレスで新規登録を実行
   - メールが届くことを確認
   - メールの内容とデザインを確認
   - 認証リンクが正しく動作することを確認

2. **パスワードリセットメール**
   - ログイン画面で「パスワードを忘れた場合」をクリック
   - テスト用のメールアドレスを入力
   - メールが届くことを確認
   - メールの内容とデザインを確認
   - リセットリンクが正しく動作することを確認

---

## 🔍 トラブルシューティング

### メールが届かない場合

1. **スパムフォルダを確認**
   - メールがスパムフォルダに振り分けられていないか確認

2. **Supabaseの設定を確認**
   - **Settings** → **Auth** → **Email Auth** でメール認証が有効になっているか確認
   - **Rate Limits** で送信制限に達していないか確認

3. **メールアドレスの確認**
   - 正しいメールアドレスを入力しているか確認
   - メールアドレスにタイポがないか確認

### テンプレートが反映されない場合

1. **保存を確認**
   - テンプレートを保存した後、ページをリロードして確認

2. **キャッシュのクリア**
   - ブラウザのキャッシュをクリア
   - 再度メール送信を試す

3. **変数の確認**
   - Supabaseのテンプレート変数（`{{ .ConfirmationURL }}`等）が正しく使用されているか確認

---

## 📚 参考リンク

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Settings](https://supabase.com/docs/guides/auth/auth-smtp)

---

*最終更新: 2025年1月*
