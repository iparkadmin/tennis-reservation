# Supabase メールテンプレート設定ガイド

## 問題：カスタムメールテンプレートが適用されない

カスタムメールテンプレートを登録しているにもかかわらず、デフォルトメールが送信される場合の対処法です。

---

## ⚠️ 重要な注意事項

### トークン名は正確に記述する必要があります

Supabaseのメールテンプレートでは、**トークン名の大文字小文字とドットの位置が重要**です。

- ✅ **正しい**: `{{.ConfirmationURL}}`（ドット付き、大文字小文字区別）
- ❌ **間違い**: `{{CONFIRMATION_LINK}}`（これは動作しません）
- ❌ **間違い**: `{{ConfirmationURL}}`（ドットがない）
- ❌ **間違い**: `{{.confirmationURL}}`（小文字）

**現在のテンプレートで`{{CONFIRMATION_LINK}}`を使用している場合、必ず`{{.ConfirmationURL}}`に変更してください。**

---

## 設定手順（Supabase Cloud / Dashboard）

### Step 1: メールテンプレート画面を開く

1. **Supabaseダッシュボード**にログイン
2. プロジェクト **「tennis court reservation」** を選択
3. 左サイドバー → **「Authentication」** をクリック
4. **「Email Templates」** をクリック
5. **「Confirm sign up」** テンプレートを選択

### Step 2: Subject（件名）を設定

**Subject**フィールドに以下を入力：
```
【iParkテニスコート予約システム】 メールアドレスの確認をお願いします
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
      この度は、テニスコート予約システムにご登録いただき、誠にありがとうございます。
    </p>
    <p style="font-size: 16px; margin-bottom: 30px; color: #333333;">
      ご登録いただいたメールアドレスを確認するため、以下のボタンをクリックしてください。
    </p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{.ConfirmationURL}}" style="display: inline-block; padding: 15px 40px; background-color: #16145F; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        メールアドレスを確認する
      </a>
    </div>
    <p style="font-size: 14px; color: #666666; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
      このメールに心当たりがない場合は、無視していただいて構いません。
    </p>
  </div>
</body>
</html>
```

**重要**: 
- `{{.ConfirmationURL}}`の部分は、**必ずこの形式で記述してください**
- `{{CONFIRMATION_LINK}}`などの間違った形式は動作しません

### Step 4: テンプレートを保存

1. 画面下部の **「Save changes」** ボタンをクリック
2. 保存が完了すると、次回のメール送信からカスタムテンプレートが適用されます

### Step 5: 動作確認

1. テストユーザーで新規登録を実行
2. 送信されたメールを確認
   - カスタムテンプレート（iParkのヘッダー、スタイル）が適用されているか
   - 確認リンクが正しく動作するか

---

## 確認事項

### 1. メールテンプレートが有効になっているか確認

1. **Supabaseダッシュボード** → **Authentication** → **Email Templates**
2. **「Confirm sign up」** テンプレートを選択
3. **重要**: Supabaseの新しいバージョンでは、「Enable custom email」のトグルが表示されない場合があります
   - カスタムメールテンプレートを編集・保存すると、自動的に有効になります
   - SubjectとBodyの両方に内容が入力されていれば、カスタムテンプレートが使用されます
4. テンプレートを保存すると、次回のメール送信からカスタムテンプレートが適用されます

### 2. メールテンプレート内のリンク確認

**重要**: メールテンプレートのHTML本文内に、以下のように**正しいトークン名**`{{.ConfirmationURL}}`を`<a>`タグで囲む必要があります：

```html
<a href="{{.ConfirmationURL}}" style="display: inline-block; padding: 15px 40px; background-color: #16145F; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
  メールアドレスを確認する
</a>
```

**⚠️ トークン名の注意（最重要）**:
- ✅ **正しい**: `{{.ConfirmationURL}}`（ドット付き、大文字小文字区別）
- ❌ **間違い**: `{{CONFIRMATION_LINK}}`（これは動作しません - よくある間違い）
- ❌ **間違い**: `{{ConfirmationURL}}`（ドットがない）
- ❌ **間違い**: `{{.confirmationURL}}`（小文字）

**現在`{{CONFIRMATION_LINK}}`を使用している場合、必ず`{{.ConfirmationURL}}`に変更してください。**

**❌ 間違った例**:
- `{{.ConfirmationURL}}`がHTML本文内に配置されていない
- トークン一覧に表示されているだけで、実際のリンクとして使われていない
- 間違ったトークン名（`{{CONFIRMATION_LINK}}`など）を使用している

**✅ 正しい例**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Hiragino Sans, Yu Gothic, Meiryo, sans-serif; line-height: 1.6; color: #333; max-width: 600px; padding: 20px;">
  <div style="background-color: #16145F; color: #ffffff; padding: 20px; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0;">iPark テニスコート予約システム</h1>
  </div>
  <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      この度は、テニスコート予約システムにご登録いただき、誠にありがとうございます。
    </p>
    <p style="font-size: 16px; margin-bottom: 20px;">
      ご登録いただいたメールアドレスを確認するため、以下のリンクをクリックしてください。
    </p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{.ConfirmationURL}}" style="display: inline-block; padding: 12px 24px; background-color: #16145F; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">
        メールアドレスを確認する
      </a>
    </p>
  </div>
</body>
</html>
```

### 3. SupabaseのURL設定確認

1. **Supabaseダッシュボード** → **Authentication** → **URL Configuration**
2. **Site URL**を確認：
   - 本番環境: `https://tennis-court-reservation-app.vercel.app`（実際のVercel URL）
   - 開発環境: `http://localhost:3000`
3. **Redirect URLs**に以下を追加：
   - `https://tennis-court-reservation-app.vercel.app/login`
   - `https://tennis-court-reservation-app.vercel.app/**`（ワイルドカード）
   - `http://localhost:3000/login`（開発環境用）

### 4. メール送信設定の確認

1. **Supabaseダッシュボード** → **Authentication** → **Email**
2. **「Enable email confirmations」**が有効になっているか確認
3. **「Enable custom SMTP」**を使用している場合、SMTP設定が正しいか確認

---

## トラブルシューティング

### 問題1: デフォルトメールが送信される（カスタムテンプレートが反映されない）

**最も多い原因**: **トークン名が間違っている**

**確認事項**:
1. **トークン名を確認**
   - `{{CONFIRMATION_LINK}}`を使っていないか？
   - `{{.ConfirmationURL}}`（ドット付き、大文字小文字正確）を使用しているか？

2. **HTML本文内にリンクが含まれているか**
   - トークン一覧に表示されているだけでは不十分
   - HTML本文内に`<a href="{{.ConfirmationURL}}">`が含まれている必要がある

3. **テンプレートが保存されているか**
   - 「Save changes」ボタンをクリックしたか？
   - 保存後、次回のメール送信から適用される

**対処法**:
1. **トークン名を修正**: `{{CONFIRMATION_LINK}}` → `{{.ConfirmationURL}}`
2. HTML本文内に`<a href="{{.ConfirmationURL}}">`を追加する
3. テンプレートを保存する（「Save changes」をクリック）
4. テストユーザーで新規登録して確認する
5. まだデフォルトメールが送信される場合、ブラウザのキャッシュをクリアして再度保存を試す

### 問題2: メール確認リンクで404エラーになる

**原因**:
- SupabaseのRedirect URLsに正しいURLが設定されていない
- `emailRedirectTo`の設定が間違っている
- アプリ側でメール確認後の処理（`type=signup`）が実装されていない

**対処法**:
1. SupabaseのRedirect URLsに`/login`を追加
2. `AuthForm.tsx`の`emailRedirectTo`が正しく設定されているか確認
3. `/login`ページで`type=signup`の処理が実装されているか確認（実装済み）

---

## メールテンプレートの完全な例

### Subject（件名）
```
【iParkテニスコート予約システム】 メールアドレスの確認をお願いします
```

### Body（本文）
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
      この度は、テニスコート予約システムにご登録いただき、誠にありがとうございます。
    </p>
    <p style="font-size: 16px; margin-bottom: 30px; color: #333333;">
      ご登録いただいたメールアドレスを確認するため、以下のボタンをクリックしてください。
    </p>
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{.ConfirmationURL}}" style="display: inline-block; padding: 15px 40px; background-color: #16145F; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        メールアドレスを確認する
      </a>
    </div>
    <p style="font-size: 14px; color: #666666; margin-top: 30px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
      このメールに心当たりがない場合は、無視していただいて構いません。
    </p>
  </div>
</body>
</html>
```

---

## 確認手順

1. **メールテンプレートを保存**
2. **テストユーザーで新規登録**
3. **送信されたメールを確認**
   - カスタムテンプレートが適用されているか
   - 確認リンクが正しく動作するか
4. **確認リンクをクリック**
   - `/login`ページにリダイレクトされるか
   - 自動的にダッシュボードに遷移するか

---

*最終更新: 2025年1月*
