# Supabase メールテンプレート

このフォルダには、Supabase Auth の Email Templates に設定する HTML が含まれています。

## 使い方

1. Supabase ダッシュボード → **Authentication** → **Email Templates** を開く
2. 各テンプレートを選択し、**Subject** と **Body** を設定
3. HTML ファイルを開き、Ctrl+A → Ctrl+C で **Body** に貼り付け
4. **Save changes** をクリック

## ファイル一覧・Subject

| ファイル | Supabase テンプレート | Subject |
|---------|---------------------|---------|
| `01_confirm_signup.html` | Confirm signup | 【iParkテニスコート予約システム】 メールアドレスの確認をお願いします |
| `02_reset_password.html` | Reset password | 【iParkテニスコート予約システム】 パスワードリセットのご案内 |
| `03_change_email.html` | Change email address | 【iParkテニスコート予約システム】 メールアドレス変更の確認をお願いします |

## 重要

- 変数は `{{.ConfirmationURL}}` のように**ドット付き**で記述する
- `{{CONFIRMATION_LINK}}` や `{{.confirmationURL}}` は**動作しない**
