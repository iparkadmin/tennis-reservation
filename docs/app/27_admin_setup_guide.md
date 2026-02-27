# 管理画面 セットアップガイド

## 概要

運営担当向けの管理画面（`/admin`）のセットアップ手順です。

## 1. データベースマイグレーションの実行

以下のマイグレーションを Supabase SQL Editor で**順番に**実行してください。

1. **23_admin_role_and_rls.sql** - 管理者ロールと RLS ポリシー
2. **24_admin_notes.sql** - 運営メモ用テーブル（23 の後に実行）
3. **25_audit_utilizers.sql** - 利用者（utilizers）の監査ログ（24 の後に実行）
4. **26_admin_utilizers_manage.sql** - 管理者による利用者の追加・編集・削除（25 の後に実行）
5. **27_user_block.sql** - ユーザーブロック機能（profiles.is_blocked、RLS 更新）（26 の後に実行）
6. **28_time_slots_2hours.sql** - 予約時間枠を2時間単位に変更（9-11, 11-13, 13-15, 15-17）（27 の後に実行）

実行内容:
- `profiles` テーブルに `role` カラムを追加（デフォルト: `'user'`）
- 管理者判定用関数 `is_admin()` の作成
- 管理者用 RLS ポリシーの追加（profiles, reservations, courts, utilizers, audit_logs）

## 2. 管理者の付与

初回は SQL で手動で管理者を1名以上付与します。

```sql
-- 例: メールアドレスを指定して管理者に設定
UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@example.com';
```

## 3. 依存関係のインストール

```bash
cd app
npm install
```

`@supabase/ssr` が追加されています（ミドルウェア用）。

## 4. 管理画面へのアクセス

1. ブラウザで `/admin` にアクセス
2. 未ログインの場合は **`/admin/login`**（管理画面専用ログイン）にリダイレクトされます
3. 管理者用のID・パスワードでログイン
4. 一般ユーザー用の `/login` とは別のログイン画面です（管理者は別アカウントで管理画面にログイン）

**デフォルト表示**: 環境変数 `NEXT_PUBLIC_ADMIN_ID` に管理者IDを設定すると、ログイン画面の管理者ID欄に初期値として表示されます（`.env.local` または Vercel の Environment Variables で設定）。

## 5. 管理画面の機能

| パス | 機能 |
|------|------|
| `/admin` | ダッシュボード（ユーザー数、予約数、直近の予約） |
| `/admin/users` | ユーザー一覧（検索・ソート）、auth/profiles 不整合の自動作成 |
| `/admin/users/[id]` | ユーザー詳細（プロフィール・予約・利用者・運営メモ・予約代行作成） |
| auth/profiles 不整合 | ユーザー一覧表示時に profiles を自動作成 |
| `/admin/reservations` | 予約一覧（日付・コートでフィルター） |
| `/admin/reservations/[id]` | 予約詳細（代理キャンセル・変更リンク） |
| `/admin/calendar` | 予約カレンダー（全予約の俯瞰） |
| `/admin/courts` | コート管理（表示名・使用可否の編集） |
| `/admin/audit-logs` | 監査ログ閲覧 |
| `/admin/password` | パスワード変更（初期パスワードから変更可能） |

## 6. セキュリティ

- `/admin` 配下は Middleware で `profiles.role = 'admin'` をチェック
- 未ログイン時は `/admin/login`（管理画面専用）へリダイレクト（一般ユーザー用 `/login` とは別）
- 一般ユーザーが `/admin/login` で一般アカウントでログインしようとすると「管理者権限がありません」で拒否
- RLS により、管理者のみ全ユーザー・全予約の閲覧・操作が可能

## 7. トラブルシューティング

### 管理画面にアクセスできない（403 / リダイレクトされる）

- `profiles.role` が `'admin'` に設定されているか確認
- マイグレーション `23_admin_role_and_rls.sql` が実行済みか確認

### データが表示されない

- ブラウザのコンソールでエラーを確認
- Supabase の RLS ポリシーが正しく設定されているか確認
