# コート2面対応 - データベース更新SQL実行ガイド

> **目的：** `05_database_update_for_courts.sql` をSupabaseダッシュボードで実行する手順

---

## 📋 前提条件

- ✅ Supabaseアカウントにログイン済み
- ✅ プロジェクトが作成済み
- ✅ `02_database_setup.sql` が既に実行済み（基本テーブルが作成されている）

---

## 🚀 実行手順

### Step 1: Supabaseダッシュボードにアクセス

1. **https://supabase.com/dashboard** にアクセス
2. ログイン（まだログインしていない場合）
3. **プロジェクトを選択**（**tennis court reservation**）

---

### Step 2: SQL Editorを開く

1. 左メニューから **「SQL Editor」** をクリック
   - メニューが見つからない場合は、**「Database」** → **「SQL Editor」** をクリック

2. **「New query」** ボタンをクリック
   - または、既存のクエリタブがある場合は、新しいタブを開く

---

### Step 3: SQLファイルの内容をコピー

1. **`doc/05_database_update_for_courts.sql`** ファイルを開く
2. **ファイルの内容をすべて選択**（Ctrl+A / Cmd+A）
3. **コピー**（Ctrl+C / Cmd+C）

**注意：** ファイル全体をコピーしてください。

---

### Step 4: SQL Editorに貼り付け

1. SupabaseのSQL Editorのクエリエリア（白いテキストエリア）をクリック
2. **貼り付け**（Ctrl+V / Cmd+V）
3. SQLが正しく貼り付けられたことを確認

**貼り付け後の画面イメージ：**
```
-- ===========================================
-- テニスコート予約システム - コート2面対応のデータベース更新
-- ===========================================
...
CREATE TABLE IF NOT EXISTS courts (
...
```

---

### Step 5: SQLを実行

1. **「Run」** ボタンをクリック
   - 画面右上または下部にある緑色の「Run」ボタン
   - または、キーボードショートカット：**Ctrl+Enter**（Windows/Linux）または **Cmd+Enter**（Mac）

2. **実行中の表示**
   - 「Running...」やローディングアイコンが表示されます
   - 数秒〜数十秒かかる場合があります

---

### Step 6: 実行結果を確認

#### ✅ 成功した場合

以下のようなメッセージが表示されます：

```
Success. No rows returned
```

または、各SQL文の成功メッセージが表示されます。

**成功メッセージの例：**
- `CREATE TABLE`
- `ALTER TABLE`
- `CREATE INDEX`
- `CREATE OR REPLACE FUNCTION`

#### ❌ エラーが発生した場合

エラーメッセージが表示されます。よくあるエラーと対処法：

**エラー1: `relation "courts" already exists`**
- **原因：** `courts`テーブルが既に存在している
- **対処法：** 問題ありません。`CREATE TABLE IF NOT EXISTS`により、既存のテーブルはそのまま使用されます。続行してください。

**エラー2: `constraint "unique_booking" does not exist`**
- **原因：** 制約が既に削除されている、または存在しない
- **対処法：** 問題ありません。`DROP CONSTRAINT IF EXISTS`により、存在しない場合はスキップされます。続行してください。

**エラー3: `column "court_id" already exists`**
- **原因：** `court_id`カラムが既に追加されている
- **対処法：** 問題ありません。`ADD COLUMN IF NOT EXISTS`により、既存のカラムはそのまま使用されます。続行してください。

**その他のエラー：**
- エラーメッセージを確認し、内容をコピーして保存してください
- 必要に応じて、エラーメッセージを共有してください

---

### Step 7: 実行結果の確認

SQL実行後、以下の確認を行ってください。

#### 7.1 Table Editorで確認

1. 左メニューから **「Table Editor」** をクリック
2. 以下のテーブルが表示されていることを確認：
   - ✅ `courts` - コート情報テーブル（新規）
   - ✅ `reservations` - 予約テーブル（`court_id`カラムが追加されている）

#### 7.2 courtsテーブルの確認

1. **Table Editor** で **`courts`** テーブルをクリック
2. 以下のデータが表示されていることを確認：
   - ✅ `court_a` - コートA
   - ✅ `court_b` - コートB

#### 7.3 reservationsテーブルの確認

1. **Table Editor** で **`reservations`** テーブルをクリック
2. カラム一覧に **`court_id`** が表示されていることを確認
3. 既存の予約がある場合、`court_id`に値が設定されていることを確認

#### 7.4 SQL Editorで確認（オプション）

以下のSQLを実行して、コートが正しく作成されているか確認：

```sql
SELECT * FROM courts;
```

**期待される結果：**
- 2行のデータが表示される
- `court_a` と `court_b` が表示される

---

## 🔍 トラブルシューティング

### 問題1: SQL Editorが見つからない

**対処法：**
1. 左メニューをスクロールして確認
2. **「Database」** メニューを展開して確認
3. ブラウザをリロード（F5）

### 問題2: 「Run」ボタンが見つからない

**対処法：**
1. 画面右上の **「Run」** ボタンを確認
2. キーボードショートカットを使用：**Ctrl+Enter**（Windows/Linux）または **Cmd+Enter**（Mac）

### 問題3: SQL実行が途中で止まる

**対処法：**
1. ブラウザをリロード（F5）
2. 再度SQLを実行
3. ネットワーク接続を確認

### 問題4: エラーが発生したが、続行できるかわからない

**対処法：**
1. エラーメッセージを確認
2. `IF NOT EXISTS` や `IF EXISTS` が含まれている場合は、通常は問題ありません
3. それでも不安な場合は、エラーメッセージを保存して確認してください

---

## ✅ 完了後の確認事項

SQL実行が成功したら、以下を確認してください：

1. ✅ `courts`テーブルが作成されている
2. ✅ `courts`テーブルに「コートA」と「コートB」が登録されている
3. ✅ `reservations`テーブルに`court_id`カラムが追加されている
4. ✅ 既存の予約に`court_id`が設定されている（既存予約がある場合）
5. ✅ アプリケーションでコート選択が表示される

---

## 🎯 次のステップ

SQL実行が完了したら：

1. ✅ アプリケーションをリロード
2. ✅ 予約カレンダーでコート選択が表示されることを確認
3. ✅ 各コートで予約が作成できることを確認
4. ✅ 予約履歴でコート情報が表示されることを確認

---

## 📚 参考リンク

- [Supabase SQL Editor Documentation](https://supabase.com/docs/guides/database/tables)
- [PostgreSQL ALTER TABLE Documentation](https://www.postgresql.org/docs/current/sql-altertable.html)

---

*最終更新: 2025年1月*
