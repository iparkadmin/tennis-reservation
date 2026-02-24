# Supabase メールテンプレート トラブルシューティング

## よくある問題と解決方法

### 問題1: カスタムメールテンプレートが適用されない（デフォルトメールが送信される）

**症状**: カスタムメールテンプレートを設定したのに、デフォルトメールが送信される

**最も多い原因**: **トークン名が間違っている**

**原因と解決方法**:

1. **トークン名が間違っている（最重要）**
   - ❌ `{{CONFIRMATION_LINK}}` → **動作しません**（よくある間違い）
   - ❌ `{{ConfirmationURL}}` → 動作しない（ドットがない）
   - ❌ `{{.confirmationURL}}` → 動作しない（小文字）
   - ✅ `{{.ConfirmationURL}}` → **正しい形式**（ドット付き、大文字小文字正確）

   **修正方法**:
   - メールテンプレート内の`{{CONFIRMATION_LINK}}`をすべて`{{.ConfirmationURL}}`に置き換える
   - 大文字小文字、ドットの位置を正確に記述する

2. **HTML本文内にリンクが含まれていない**
   - トークン一覧に`{{.ConfirmationURL}}`が表示されていても、HTML本文内に`<a>`タグで配置する必要があります
   - 以下のように、HTML本文内に必ず配置してください：
   ```html
   <a href="{{.ConfirmationURL}}">メールアドレスを確認する</a>
   ```

3. **テンプレートが保存されていない**
   - 「Save changes」ボタンをクリックして保存してください
   - 保存後、次回のメール送信からカスタムテンプレートが適用されます
   - ブラウザのキャッシュをクリアして再度保存を試す

### 問題2: 「Enable custom email」のオプションが見つからない

**症状**: Supabaseダッシュボードに「Enable custom email」のトグルが見当たらない

**解決方法**:
- Supabaseの新しいバージョンでは、このトグルが表示されない場合があります
- **カスタムメールテンプレートを編集・保存すると、自動的に有効になります**
- SubjectとBodyの両方に内容が入力されていれば、カスタムテンプレートが使用されます
- 特別な有効化操作は不要です

### 問題3: メール確認リンクで404エラーになる

**症状**: メール内の確認リンクをクリックすると404エラーになる

**原因と解決方法**:

1. **SupabaseのRedirect URLs設定**
   - Supabaseダッシュボード → Authentication → URL Configuration
   - Redirect URLsに以下を追加：
     - `https://tennis-court-reservation-app.vercel.app/login`
     - `https://tennis-court-reservation-app.vercel.app/**`（ワイルドカード）

2. **emailRedirectToの設定**
   - `AuthForm.tsx`で`emailRedirectTo`が正しく設定されているか確認
   - `NEXT_PUBLIC_APP_URL`環境変数が設定されているか確認

3. **アプリ側の処理**
   - `/login`ページで`type=signup`の処理が実装されているか確認（実装済み）

### 問題4: メールが送信されない

**症状**: 新規登録してもメールが届かない

**確認事項**:
1. Supabaseダッシュボード → Authentication → Email
2. 「Enable email confirmations」が有効になっているか確認
3. 「Enable custom SMTP」を使用している場合、SMTP設定が正しいか確認
4. スパムフォルダを確認

---

## 正しいメールテンプレートの例

### Subject（件名）
```
【iParkテニスコート予約システム】 メールアドレスの確認をお願いします
```

### Body（本文） - 完全版
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

**重要**: `{{.ConfirmationURL}}`の部分は、**必ずこの形式で記述してください**。大文字小文字、ドットの位置が重要です。

---

## 確認手順

1. **メールテンプレートを保存**
   - SubjectとBodyの両方を入力
   - 「Save changes」をクリック

2. **トークン名を確認**
   - HTML本文内に`<a href="{{.ConfirmationURL}}">`が含まれているか
   - `{{CONFIRMATION_LINK}}`などの間違った形式を使っていないか

3. **SupabaseのURL設定を確認**
   - Site URLが正しく設定されているか
   - Redirect URLsに`/login`が追加されているか

4. **テストユーザーで新規登録**
   - 送信されたメールを確認
   - カスタムテンプレートが適用されているか
   - 確認リンクが正しく動作するか

---

*最終更新: 2025年1月*
