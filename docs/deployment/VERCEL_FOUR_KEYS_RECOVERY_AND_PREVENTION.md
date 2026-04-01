# Vercel「4キー」復旧・再発防止（テニスコート予約）

> **「4件」＝本プロジェクトで Vercel に載せる主な環境変数 4 つ**を指す。  
> （必須3 + 推奨1: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_APP_URL` / `SUPABASE_SERVICE_ROLE_KEY`）

ダッシュボード上の値は **Git にコミットしない**。復旧時は **必ず Supabase ダッシュボードの該当プロジェクト**からコピーする。

---

## 1. まず押さえる原則（混線防止）

| 原則 | 理由 |
|------|------|
| **Vercel チームと Supabase org を 1:1 で対応させる** | URL/キーを別環境の Supabase から入れると、ログイン・予約・削除が別DBに向く |
| **環境変数を変えたら必ず Redeploy** | ビルド・実行時に読み込まれるのはデプロイ時点の値 |
| **`NEXT_PUBLIC_APP_URL` は「その Vercel プロジェクトの本番 URL」** | 別プロジェクトの `*.vercel.app` のままだとリダイレクト・リンクが壊れる |

環境の対応表は **`ENVIRONMENT_WORKFLOW_RULE.md`** が正。**Import 時に別リポジトリ・別 Root を選び直す**と、意図せず設定が上書きされることがある。

---

## 2. どの Vercel プロジェクトを直すか

作業前に **Vercel の Team** を確認する。

| 呼び名 | Vercel（ダッシュボード URL） | 紐づける GitHub | Supabase org（キーの出所） |
|--------|-------------------------------|-----------------|---------------------------|
| **元環境** | チーム `https://vercel.com/mtatsuhito-gmailcoms-projects`（vault 用プロジェクト） | `https://github.com/TatsuhitoDT/vault`（Root: `tennis-reservation`） | `org/dfiufvdhbtaitktitzwh` |
| **コピー環境** | プロジェクト `https://vercel.com/muramatsus-projects/tennis-reservation` | `https://github.com/iparkadmin/tennis-reservation` | `org/qtgzpqlzgojkjwsigvww` |

**ペアを入れ替えないこと**（vault ↔ mtatsuhito、iparkadmin/tennis-reservation ↔ muramatsus/tennis-reservation が正）。

**通常の運用で直すのはコピー環境側**（README・`ENVIRONMENT_WORKFLOW_RULE.md` 参照）。  
「4プロジェクト全部」と書いてある場合は、**チーム内の各プロジェクト**に対して、下表の **4キーがそのプロジェクト用の Supabase だけを指しているか**を順に確認する。

---

## 3. 復旧手順（4キーを正しい組み合わせで入れ直す）

各 **Vercel プロジェクト**で以下を実施。

### Step A: Supabase 側で値を取得（キーの出所を間違えない）

1. 上表の **org** にログインし、**テニスコート予約用のプロジェクト**を開く（プロジェクトが複数ある場合は名前で確認）。
2. **Settings → API**（または API Keys）で次をコピー。
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon（public）** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role（secret）** → `SUPABASE_SERVICE_ROLE_KEY`

### Step B: Vercel 側に設定

1. **Settings → Environment Variables**
2. 次の 4 つを **Production / Preview / Development すべて**に設定（値は Step A と **このプロジェクトの本番 URL**）。

| Key | 値のルール |
|-----|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Step A の Project URL のみ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Step A の anon のみ |
| `NEXT_PUBLIC_APP_URL` | **この Vercel プロジェクトの**本番 URL（例: `https://<project-name>.vercel.app`）。Deployments 画面の URL をコピーするのが確実。 |
| `SUPABASE_SERVICE_ROLE_KEY` | Step A の service_role のみ |

3. **Deployments** → 最新の **⋯ → Redeploy** → **Use existing Build Cache をオフ**推奨 → Redeploy。

### Step C: Supabase Auth の URL（ログイン失敗対策）

環境変数を直したら **必ず** Supabase 側も整合させる。

1. **Authentication → URL Configuration**
2. **Site URL** = その環境の `NEXT_PUBLIC_APP_URL` と同じ本番 URL。
3. **Redirect URLs** に `https://<同じホスト>/**` および `/login` 等を追加。

---

## 4. 「全部書き換わった」を今後防ぐ

| 対策 | 内容 |
|------|------|
| **変更前スナップショット** | Vercel の Environment Variables 画面を **変更前にスクショ or メモ**（値は秘密情報なので **パスワードマネージャ**に保存するのが安全）。 |
| **新規 Import で注意** | 同じ Git リポジトリを **別 Vercel プロジェクトに再度 Import** すると、ウィザードで **別の env を入力**し直し、既存プロジェクトと取り違えやすい。**既存プロジェクトの Settings だけ**を触る運用に寄せる。 |
| **Root Directory の確認** | vault モノレポは **`tennis-reservation`**。単独リポジトリは **`app`** かルートか、**`06_vercel_deployment_guide.md`** と README の「モノレポ上の位置」に合わせる。 |
| **AI・作業者への指示** | 環境指定なしの作業は **コピー環境**（`ENVIRONMENT_WORKFLOW_RULE.md`）。**元環境の Vercel を触るなら「元環境で」と明示**する。 |

---

## 5. ドキュメント内の URL について

README や旧ドキュメントに **別名の `*.vercel.app`** が残っていることがある。  
**真実の本番 URL は常に Vercel ダッシュボードの Deployments に表示される URL** とし、ドキュメントは **参照用**として読み替えること。

---

## 関連

- [ENVIRONMENT_WORKFLOW_RULE.md](./ENVIRONMENT_WORKFLOW_RULE.md) — 元/コピー、push 先
- [07_vercel_env_variables.md](./07_vercel_env_variables.md) — 変数の意味・トラブルシュート
- [GIT_VERCEL_DEPLOY.md](./GIT_VERCEL_DEPLOY.md) — Git 連携初回

*最終更新: 2026年3月*
