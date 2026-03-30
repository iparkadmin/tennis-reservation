# Supabaseデータベースセットアップガイド

## 📋 前提条件

- ✅ Supabaseアカウント作成済み
- ✅ プロジェクト作成済み
- ✅ プロジェクトURL: `.env.example` ファイルを参照

---

## Step 1: Supabaseダッシュボードにアクセス

1. **https://supabase.com/dashboard** にログイン
2. プロジェクトを選択（Supabase の Project Name: **tennis court reservation**。プロジェクトIDは `.env.example` を参照）

---

## Step 2: SQL Editorを開く

1. 左メニューから **「SQL Editor」** をクリック
2. **「New query」** ボタンをクリック

---

## Step 3: SQLを実行

### 3.1 SQLファイルを開く

`doc/02_database_setup.sql` ファイルを開いて、内容をすべてコピーしてください。

### 3.2 SQL Editorに貼り付け

1. SupabaseのSQL Editorのクエリエリアに貼り付け
2. **「Run」** ボタン（または Ctrl+Enter）をクリック

### 3.3 実行結果を確認

成功すると、以下のメッセージが表示されます：
- `Success. No rows returned`
- または、各CREATE文の成功メッセージ

---

## Step 4: テーブルの確認

### 4.1 Table Editorで確認

1. 左メニューから **「Table Editor」** をクリック
2. 以下のテーブルが表示されていることを確認：
   - ✅ `profiles` - ユーザー情報テーブル
   - ✅ `reservations` - 予約データテーブル

### 4.2 テーブル構造の確認

各テーブルをクリックして、カラムが正しく作成されていることを確認：

#### `profiles` テーブル
- `id` (uuid, Primary Key)
- `full_name` (text)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `reservations` テーブル
- `id` (uuid, Primary Key)
- `user_id` (uuid, Foreign Key)
- `booking_date` (date)
- `start_time` (time)
- `end_time` (time)
- `created_at` (timestamp)

---

## Step 5: RLS（Row Level Security）の確認

### 5.1 Authentication > Policiesで確認

1. 左メニューから **「Authentication」** → **「Policies」** をクリック
2. 以下のポリシーが設定されていることを確認：

#### `profiles` テーブル
- ✅ "Users can view own profile" (SELECT)
- ✅ "Users can update own profile" (UPDATE)
- ✅ "Users can insert own profile" (INSERT)

#### `reservations` テーブル
- ✅ "Anyone can view reservations" (SELECT)
- ✅ "Authenticated users can create reservations" (INSERT)
- ✅ "Users can delete own reservations" (DELETE)

---

## Step 6: トリガーの確認

### 6.1 Database > Functionsで確認

1. 左メニューから **「Database」** → **「Functions」** をクリック
2. 以下の関数が作成されていることを確認：
   - ✅ `handle_new_user()` - 新規ユーザー登録時にprofileを作成
   - ✅ `check_daily_limit()` - 1日最大2時間制限をチェック

---

## ✅ セットアップ完了チェックリスト

- [ ] SQL EditorでSQLを実行
- [ ] `profiles` テーブルが作成されている
- [ ] `reservations` テーブルが作成されている
- [ ] RLSポリシーが設定されている
- [ ] トリガー関数が作成されている
- [ ] エラーが発生していない

---

## 🔧 トラブルシューティング

### エラーが発生した場合

#### エラー: "relation already exists"
- テーブルが既に存在している場合
- 解決策: SQLの `CREATE TABLE IF NOT EXISTS` を使用しているので、エラーは無視して続行可能

#### エラー: "permission denied"
- 権限の問題
- 解決策: Supabaseのプロジェクトオーナーでログインしていることを確認

#### エラー: "function already exists"
- 関数が既に存在している場合
- 解決策: SQLの `CREATE OR REPLACE FUNCTION` を使用しているので、既存の関数が上書きされます

---

## 📝 次のステップ

データベースのセットアップが完了したら：

1. **Vercelで環境変数を設定**（まだの場合）
2. **Vercelで再デプロイ**
3. **アプリで動作確認**
   - 新規ユーザー登録
   - ログイン
   - 予約作成
   - 予約キャンセル

---

*最終更新: 2025年1月*
