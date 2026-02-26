# アカウント移管ガイド（Supabase / GitHub / Vercel）

異なるアカウントの Supabase、GitHub、Vercel へ安全に移管する手順です。

---

## 📋 移管の全体像

| サービス | 現状 | 移管後 |
|----------|------|--------|
| **Supabase** | 既存プロジェクト（yawzyrzfbphxrthlrzjg） | 新アカウントで新規プロジェクト作成 |
| **GitHub** | vault モノレポ内（tennis-reservation サブフォルダ） | 新アカウントで単独リポジトリ作成 |
| **Vercel** | tennis-reservation-one.vercel.app | 新アカウントで新規プロジェクト作成 |

**推奨順序**: Supabase → GitHub → Vercel（依存関係に従う）

---

## Phase 1: 事前準備（移管前に実施）

### 1.1 現行環境の情報を控える

| 項目 | 取得場所 | 用途 |
|------|----------|------|
| Supabase Project URL | Settings → API | 新 Supabase 作成後の比較用 |
| Supabase Anon Key | Settings → API | 同上 |
| Supabase Service Role Key | Settings → API | 同上（秘密） |
| Supabase Auth の Site URL | Authentication → URL Configuration | 新 Supabase で同じパターンで設定 |
| Supabase Auth の Redirect URLs | 同上 | 同上 |
| SMTP 設定（カスタム使用時） | Project Settings → Auth → SMTP | 新 Supabase で再設定 |
| メールテンプレート（カスタム時） | Authentication → Email Templates | 新 Supabase で再設定 |

### 1.2 本番データの有無を確認

- **データ移行が必要な場合**: Supabase ダッシュボード → Table Editor で `profiles`, `reservations` 等のデータをエクスポート（CSV または SQL）
- **データ移行が不要な場合**: 新 Supabase でマイグレーションのみ実行すればよい

### 1.3 新アカウントの準備

- [ ] 新 Supabase アカウント作成
- [ ] 新 GitHub アカウント作成（または既存の別アカウント）
- [ ] 新 Vercel アカウント作成（GitHub と連携）

---

## Phase 2: Supabase 移管

### 2.1 新 Supabase プロジェクト作成

1. 新 Supabase アカウントで https://supabase.com/dashboard にログイン
2. **New Project** をクリック
3. 組織・プロジェクト名・リージョン・パスワードを設定
4. **Create new project** を実行

### 2.2 マイグレーションの実行

マイグレーションは **番号順** に実行します。

| 順序 | ファイル |
|------|----------|
| 1 | `02_database_setup.sql` |
| 2 | `03_reservations_update_policy.sql` |
| 3 | `04_database_update_for_mypage.sql` |
| 4 | `05_database_update_for_courts.sql` |
| 5 | `16_security_improvements.sql` |
| 6 | `17_additional_security.sql` |
| 7 | `18_drop_phone_from_profiles.sql` |
| 8 | `19_fix_security_definer_view.sql` |
| 9 | `20_fix_security_advisor_warnings.sql` |
| 10 | `21_utilizers_table.sql` |
| 11 | `22_utilizers_simplify.sql` |
| 12 | `23_admin_role_and_rls.sql` |
| 13 | `24_admin_notes.sql` |
| 14 | `25_audit_utilizers.sql` |
| 15 | `26_admin_utilizers_manage.sql` |
| 16 | `27_user_block.sql` |
| 17 | `28_time_slots_2hours.sql` |

**実行方法**（いずれか）:

- **SQL Editor**: 各ファイルの内容をコピー → Supabase SQL Editor に貼り付け → Run
- **スクリプト**: `database/scripts/run-sql-via-api.js` を使用（`SUPABASE_ACCESS_TOKEN` と `SUPABASE_PROJECT_REF` を新プロジェクト用に設定）

### 2.3 本番データのインポート（必要な場合）

- エクスポートした CSV を Table Editor の Import で取り込む
- または SQL で `INSERT` を実行
- **注意**: `auth.users` は Supabase の管理下のため、ユーザーは再登録が必要になる場合があります

### 2.4 Auth 設定

1. **Authentication** → **URL Configuration**
2. **Site URL**: 新 Vercel の URL（例: `https://your-new-app.vercel.app`）
3. **Redirect URLs** に以下を追加:
   - `https://your-new-app.vercel.app/**`
   - `https://your-new-app.vercel.app/login`
   - `https://your-new-app.vercel.app/forgot-password`
   - `https://your-new-app.vercel.app/dashboard`
   - `https://your-new-app.vercel.app/my-bookings`
4. **Save** をクリック

### 2.5 メール・SMTP（カスタム使用時）

- **Project Settings** → **Auth** → **SMTP Settings** で Resend / SMTP2GO 等を再設定
- **Authentication** → **Email Templates** でカスタムテンプレートを再設定

### 2.6 API キーの取得

- **Settings** → **API** から以下を控える:
  - Project URL
  - anon (public) key
  - service_role key（秘密）

---

## Phase 3: GitHub 移管

### 3.1 新リポジトリの作成

1. 新 GitHub アカウントで https://github.com/new にアクセス
2. **Repository name**: `tennis-court-reservation-app`（任意の名前で可）
3. **Public** または **Private** を選択
4. **Add a README file** はチェックしない
5. **Create repository** をクリック

### 3.2 tennis-reservation を単独リポジトリとしてプッシュ

**方法 A: サブツリーで新リポジトリにプッシュ（履歴を引き継ぐ）**

```powershell
# Git ルートが c:\Dev の場合（vault がサブフォルダ）
cd c:\Dev
git subtree split -P vault/tennis-reservation -b tennis-reservation-standalone
```

```powershell
mkdir c:\Dev\tennis-reservation-transfer
cd c:\Dev\tennis-reservation-transfer
git init
git pull c:\Dev tennis-reservation-standalone
git remote add origin https://github.com/NEW_USERNAME/tennis-court-reservation-app.git
git branch -M main
git push -u origin main
```

**方法 B: フォルダをコピーして新規リポジトリ化（履歴なし・シンプル）**

```powershell
# tennis-reservation フォルダをコピー（.git は含めない）
xcopy c:\Dev\vault\tennis-reservation c:\Dev\tennis-reservation-transfer /E /I /EXCLUDE:exclude.txt
# exclude.txt に .git を記載するか、手動で .git を削除

cd c:\Dev\tennis-reservation-transfer
git init
git add .
git commit -m "Initial commit: Tennis reservation app"
git remote add origin https://github.com/NEW_USERNAME/tennis-court-reservation-app.git
git branch -M main
git push -u origin main
```

**方法 B の簡易版（PowerShell）**:

```powershell
cd c:\Dev\vault\tennis-reservation
# 親の .git を参照しないよう、一時的にコピー
robocopy . c:\Dev\tennis-reservation-transfer /E /XD .git node_modules .next
cd c:\Dev\tennis-reservation-transfer
git init
git add .
git commit -m "Initial commit: Tennis reservation app"
git remote add origin https://github.com/NEW_USERNAME/tennis-court-reservation-app.git
git branch -M main
git push -u origin main
```

### 3.3 .env.example の更新（任意）

新 Supabase の Project ID が変わった場合、`.env.example` のコメント内の Project ID を更新しておくと分かりやすいです（実際のキーは記載しない）。

---

## Phase 4: Vercel 移管

### 4.1 新 Vercel プロジェクトの作成

1. 新 Vercel アカウントで https://vercel.com にログイン
2. **Add New...** → **Project**
3. **Import Git Repository** で Phase 3 で作成した GitHub リポジトリを選択
4. **Import** をクリック

### 4.2 プロジェクト設定

| 項目 | 値 |
|------|-----|
| **Framework Preset** | Next.js（自動検出） |
| **Root Directory** | 空のまま（リポジトリルートが tennis-reservation の場合） |
| **Build Command** | `cd app && npm run build`（vercel.json で指定済みの場合は自動） |
| **Output Directory** | `app/.next`（同上） |
| **Install Command** | `npm install && cd app && npm install`（同上） |

`vercel.json` がリポジトリに含まれているため、多くの設定は自動で読み込まれます。

### 4.3 環境変数の設定

**Settings** → **Environment Variables** で以下を追加:

| Key | Value | 環境 |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 新 Supabase の Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 新 Supabase の anon key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | 新 Vercel の URL（例: `https://xxx.vercel.app`） | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | 新 Supabase の service_role key | Production, Preview, Development |

### 4.4 デプロイ

1. **Deploy** をクリック
2. デプロイ完了後、表示される URL を控える
3. **NEXT_PUBLIC_APP_URL** がデプロイ後の URL と異なる場合は、環境変数を更新して再デプロイ

### 4.5 Supabase Auth の最終確認

デプロイ後の URL が確定したら、Supabase の **Authentication** → **URL Configuration** で:

- **Site URL** を実際の本番 URL に更新
- **Redirect URLs** に本番 URL ベースのパスを追加

---

## Phase 5: 動作確認

- [ ] トップページが表示される
- [ ] 新規登録ができる
- [ ] ログイン・ログアウトができる
- [ ] 予約の作成・キャンセルができる
- [ ] パスワードリセットメールが届く（SMTP 設定済みの場合）
- [ ] 管理機能（admin）が動作する（使用している場合）

---

## セキュリティ上の注意

1. **キーの扱い**
   - `SUPABASE_SERVICE_ROLE_KEY` は絶対にクライアントに露出させない
   - `.env` や `.env.local` は git にコミットしない（既に .gitignore 済み）

2. **移管後の旧環境**
   - 移管完了後、旧 Supabase プロジェクトは必要に応じて停止・削除
   - 旧 Vercel プロジェクトも同様
   - 旧 GitHub リポジトリから tennis-reservation を削除するか、リポジトリごとアーカイブ

3. **ドメイン**
   - カスタムドメインを使用している場合、Vercel の新プロジェクトでドメインを再設定する必要があります

---

## トラブルシューティング

### 認証エラー（リダイレクト失敗）

- Supabase の Site URL と Redirect URLs が Vercel の URL と一致しているか確認
- `NEXT_PUBLIC_APP_URL` が正しいか確認

### ビルドエラー

- `vercel.json` の `buildCommand` が `cd app && npm run build` になっているか確認
- Root Directory が空（またはリポジトリルート）か確認

### 環境変数が反映されない

- 環境変数追加・変更後は **Redeploy** が必要
- Production / Preview / Development のすべてに設定されているか確認

---

## チェックリスト（移管完了用）

- [ ] 新 Supabase プロジェクト作成
- [ ] 全マイグレーション実行
- [ ] Supabase Auth（Site URL, Redirect URLs）設定
- [ ] SMTP・メールテンプレート設定（必要な場合）
- [ ] 新 GitHub リポジトリ作成・コードプッシュ
- [ ] 新 Vercel プロジェクト作成
- [ ] Vercel 環境変数 4 つ設定
- [ ] 初回デプロイ成功
- [ ] 動作確認完了
- [ ] 旧環境の停止・削除（任意）

---

*作成日: 2026-02-26*
