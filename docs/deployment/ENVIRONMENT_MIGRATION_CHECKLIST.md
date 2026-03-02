
# 環境1→環境2 完全引越しチェックリスト

> **状況**: 環境1で改修中 → 最終化後に環境2へ完全移行
> **環境2**: GitHub / Supabase / Vercel アカウント作成済、Supabase DB 作成済
>
> **リポジトリ構成**:
> - **PC内**: 同じローカルリポジトリを共用（1フォルダで開発）
> - **GitHub**: 環境1用・環境2用で別リポジトリ（複数リモートで push 先を切り替え）

---

## Phase 0: 準備（今のうちに済ませておくこと）

| # | タスク | 環境2で確認 |
|---|--------|-------------|
| 0.1 | Supabase DB | `00_full_setup_fresh.sql` 実行済みであること |
| 0.2 | 検証 | `00_verify_restore_status.sql` で7テーブル・関数・トリガーを確認 |
| 0.3 | 管理者付与 | 1人以上サインアップ後、`UPDATE profiles SET role = 'admin' WHERE email = '...'` を実行 |
| 0.4 | GitHub リポジトリ | 環境2用の tennis-reservation リポジトリが存在すること |
| 0.5 | Vercel プロジェクト | 環境2用プロジェクトが作成済み（または作成手順を把握） |

---

## Phase 1: 環境1の最終化

### 1.1 改修の完了確認

- [ ] 残タスク一覧を作成し、すべて完了させる
- [ ] ローカルで `npm run build` が通ることを確認
- [ ] 環境1で本番相当の動作確認（予約フロー、管理画面、メール等）

### 1.2 移行前に控える情報（環境1）

| 項目 | 取得場所 | メモ欄 |
|------|----------|--------|
| Auth Site URL | Supabase → Authentication → URL Configuration | |
| Auth Redirect URLs | 同上 | |
| メールテンプレート（カスタム使用時） | Authentication → Email Templates | ファイルに保存推奨 |
| SMTP 設定（カスタム使用時） | Project Settings → Auth → SMTP | |

### 1.3 データ移行の要否

- [ ] **移行する**: profiles, reservations, utilizers 等のデータをエクスポート
- [ ] **移行しない**: 環境2は空のDBで開始（ユーザーは再登録）

※ auth.users は Supabase 管理のため、ユーザーは基本的に再登録が必要です。

---

## Phase 2: コード・設定の移行

### 2.1 複数リモートの設定（初回のみ）

同じローカルリポジトリから、環境1・環境2それぞれの GitHub に push できるようにする。

```powershell
cd c:\Dev   # または vault のルート
git remote -v   # 現在のリモート確認（origin = 環境1 想定）

# 環境2用リモートを追加（名前は env2 や production など任意）
git remote add env2 https://github.com/環境2ユーザー名/tennis-reservation.git
```

### 2.2 環境1の変更をコミット・プッシュ

```powershell
git add .
git status   # 確認
git commit -m "..."
git push origin main   # 環境1の GitHub へ
```

### 2.3 環境2の GitHub リポジトリへ反映（引越し時）

```powershell
# 同じローカルの最新を環境2へ push
git push env2 main
```

※ `env2` は 2.1 で追加したリモート名。環境2の Vercel がこのリポジトリを監視していれば自動デプロイされる。

### 2.4 環境2の Vercel 環境変数

| Key | 値（環境2の Supabase） |
|-----|------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 環境2 Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 環境2 Supabase の anon key |
| `NEXT_PUBLIC_APP_URL` | 環境2 Vercel の URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 環境2 Supabase の service_role key |

---

## Phase 3: 環境2の Supabase Auth 設定

| # | タスク | 詳細 |
|---|--------|------|
| 3.1 | Site URL | 環境2の Vercel URL を設定 |
| 3.2 | Redirect URLs | `https://環境2URL/**`, `/login`, `/forgot-password` 等を追加 |
| 3.3 | メールテンプレート | 環境1と同じ内容を `docs/deployment/supabase_email_templates/` からコピー |
| 3.4 | SMTP（任意） | 環境1でカスタムSMTP使用時は同様に設定 |

---

## Phase 4: 切り替え・検証

### 4.1 環境2でデプロイ

- Vercel が GitHub 連携済みなら、 push で自動デプロイ
- または Vercel ダッシュボードから **Redeploy**

### 4.2 環境2の動作確認

- [ ] トップ表示
- [ ] 新規登録・メール認証
- [ ] ログイン・ログアウト
- [ ] 予約作成・キャンセル・利用者紐付け
- [ ] 管理者ログイン・管理機能
- [ ] パスワードリセット・メールアドレス変更（メール送信確認）

### 4.3 本番切替

- [ ] ドメイン設定（カスタムドメイン使用時）
- [ ] 環境2を本番として利用開始
- [ ] 利用者への案内（URL変更等）

---

## Phase 5: 環境1の整理（任意）

- [ ] 環境1の Supabase を停止 or アーカイブ
- [ ] 環境1の Vercel プロジェクトを停止 or 削除
- [ ] 環境1の GitHub リポジトリをアーカイブ（使用しなくなった場合）

---

## 間違い防止のポイント

1. **環境を必ず明示する**
   - 作業前に「今どちらの環境か」を確認する
   - `git push origin` = 環境1、`git push env2` = 環境2 とリモートで区別
   - Supabase / Vercel の Dashboard はプロジェクト名で判別

2. **キーの取り違え防止**
   - 環境1と環境2の Supabase キーを別々にメモし、貼り付ける前に「環境2用」と確認

3. **Auth の Site URL を最後に固める**
   - 環境2の Vercel URL が確定してから、Supabase Auth の Site URL・Redirect URLs を設定する

4. **段階的に進める**
   - Phase 1 完了 → Phase 2 → Phase 3 → Phase 4 の順で実施
   - 各 Phase のチェックを外してから次へ

5. **バックアップ**
   - 環境1の DB データをエクスポートしておく（移行後に参照する場合）
