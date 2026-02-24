# Supabase メールアドレス変更テンプレート設定ガイド

## 概要

ユーザーがメールアドレスを変更する際に送信される「Change email address」メールテンプレートの設定方法です。

---

## 設定手順

### Step 1: メールテンプレート画面を開く

1. **Supabaseダッシュボード**にログイン
2. プロジェクト **「tennis court reservation」** を選択
3. 左サイドバー → **「Authentication」** をクリック
4. **「Email Templates」** をクリック
5. **「Change email address」** テンプレートを選択

### Step 2: Subject（件名）を設定

**Subject**フィールドに以下を入力：
```
【iParkテニスコート予約システム】 メールアドレス変更の確認をお願いします
```

### Step 3: Body（本文）を設定

**Body**フィールドに、以下のHTMLを**完全にコピー＆ペースト**してください：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'MS PGothic', sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background-color: #16145F; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; border-top: none;">
    <p style="font-size: 16px; margin-bottom: 20px; color: #333333;">
      メールアドレスの変更リクエストを受け付けました。
    </p>
    <p style="font-size: 16px; margin-bottom: 20px; color: #333333;">
      新しいメールアドレス: <strong>{{.NewEmail}}</strong>
    </p>
    <p style="font-size: 16px; margin-bottom: 30px; color: #333333;">
      このメールアドレスに変更するには、以下のボタンをクリックして確認してください。
    </p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{.ConfirmationURL}}" style="display: inline-block; padding: 15px 40px; background-color: #16145F; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        メールアドレスを変更する
      </a>
    </div>
    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin-top: 30px;">
      <p style="font-size: 13px; color: #856404; margin: 0; font-weight: bold;">
        ⚠️ このメールは送信専用です。返信はできません。
      </p>
    </div>
    <p style="font-size: 14px; color: #666666; margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
      このメールに心当たりがない場合は、無視していただいて構いません。
    </p>
  </div>
</body>
</html>
```

**重要**: 
- `{{.ConfirmationURL}}`の部分は、**必ずこの形式で記述してください**
- `{{.NewEmail}}`は新しいメールアドレスを表示するトークンです

### Step 4: テンプレートを保存

1. 画面下部の **「Save changes」** ボタンをクリック
2. 保存が完了すると、次回のメールアドレス変更リクエストからカスタムテンプレートが適用されます

---

## 利用可能なトークン

メールアドレス変更テンプレートで使用できるトークン：

- `{{.ConfirmationURL}}` - メールアドレス変更を確認するためのリンク
- `{{.NewEmail}}` - 新しいメールアドレス
- `{{.Email}}` - 現在の（古い）メールアドレス
- `{{.SiteURL}}` - アプリケーションのサイトURL
- `{{.Token}}` - 6桁のOTPコード（リンクの代わりに使用可能）
- `{{.TokenHash}}` - トークンのハッシュ値

---

## 動作フロー

1. **ユーザーがメールアドレス変更をリクエスト**
   - プロフィールページで新しいメールアドレスを入力
   - 「変更メールを送信」ボタンをクリック

2. **確認メールが送信される**
   - 新しいメールアドレスに「Change email address」テンプレートのメールが送信される
   - メール内に確認リンクが含まれる

3. **メール内のリンクをクリック**
   - `/login`ページにリダイレクトされる（`type=email_change`）
   - セッションが自動的に設定される
   - プロフィールページにリダイレクトされる

4. **メールアドレス変更が完了**
   - 新しいメールアドレスが有効になる
   - プロフィール情報も更新される

---

## 確認手順

1. **メールテンプレートを保存**
   - SubjectとBodyの両方を入力
   - 「Save changes」をクリック

2. **テストユーザーでメールアドレス変更を試す**
   - プロフィールページでメールアドレス変更をリクエスト
   - 新しいメールアドレスに確認メールが届くか確認

3. **確認メールを確認**
   - カスタムテンプレートが適用されているか
   - 新しいメールアドレス（`{{.NewEmail}}`）が正しく表示されているか
   - 確認リンクが正しく動作するか

4. **確認リンクをクリック**
   - `/login`ページにリダイレクトされるか
   - 自動的にプロフィールページに遷移するか
   - メールアドレスが正しく変更されているか

---

## トラブルシューティング

### 問題1: デフォルトメールが送信される

**原因**:
- トークン名が間違っている（`{{CONFIRMATION_LINK}}`など）
- テンプレートが保存されていない

**対処法**:
1. トークン名を`{{.ConfirmationURL}}`に修正
2. テンプレートを保存する

### 問題2: メールアドレス変更リンクで404エラーになる

**原因**:
- SupabaseのRedirect URLsに正しいURLが設定されていない

**対処法**:
1. Supabaseダッシュボード → Authentication → URL Configuration
2. Redirect URLsに`/login`を追加

---

*最終更新: 2025年1月*
