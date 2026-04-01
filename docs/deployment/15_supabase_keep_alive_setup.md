# Supabase Keep Alive セットアップガイド

Supabase 無料プランでは、**7日間アクティビティがない**とプロジェクトがポーズし、その後削除される可能性があります。このガイドでは、GitHub Actions で定期的に DB にアクセスし、ポーズを防ぐ仕組みのセットアップ方法を説明します。

**どちらの Git に載せるか**: **元環境だけ**のときは **`TatsuhitoDT/vault` の `origin` へだけ** push する（本節の iparkadmin 手順は使わない）。**コピー環境（`iparkadmin/tennis-reservation`）へ反映するときだけ**、以下の方法 A〜C を使う。

---

## コピー環境（iparkadmin）へ push するときの手順

### 方法 A: .env.git.local を使う（推奨）

PAT をローカルに保存し、スクリプトで利用する方法です。

1. **認証情報ファイルの作成**
   ```powershell
   copy .env.git.example .env.git.local
   ```
   （モノレポ **vault** のリポジトリルートで実行。）  
   `.env.git.local` を編集し、`GITHUB_USERNAME` と `GITHUB_PAT` を設定（`.env.git.local` は `.gitignore` で除外済み）

2. **コピー先が iparkadmin であることを確認したうえで**スクリプトで push
   ```powershell
   cd tennis-reservation\scripts
   .\push-iparkadmin.ps1
   ```

3. **vault（元環境）の履歴も GitHub に残す必要がある場合のみ**、続けて vault へ push
   ```powershell
   cd c:\Dev\vault
   git push origin main
   ```

### 方法 B: 手動で subtree push

```powershell
cd c:\Dev\vault
git subtree push --prefix=tennis-reservation iparkadmin main
# vault の変更も origin に残す必要がある場合のみ
git push origin main
```

※ 初回は `git remote add iparkadmin https://github.com/iparkadmin/tennis-reservation.git` が必要

### 方法 C: ファイル同期（subtree が失敗するとき・推奨の代替）

次のとき **git subtree を使わず**、`vault/tennis-reservation` の中身を **単独リポジトリの作業ツリーにコピー**してから commit / push する。

- `git subtree push` が **non-fast-forward** で拒否される
- GitHub の **Push Protection** により、モノレポの**過去コミットに含まれる別ディレクトリの秘密**などで push がブロックされる

**手順**

1. 別フォルダに `iparkadmin/tennis-reservation` を clone する。  
   例: `git clone https://github.com/iparkadmin/tennis-reservation.git C:\work\iparkadmin-tennis-reservation`
2. vault ルートに `.env.git.local`（`GITHUB_USERNAME` / `GITHUB_PAT`）を用意する（方法 A と同じ）。
3. PowerShell で実行する。

   ```powershell
   cd tennis-reservation\scripts
   .\publish-iparkadmin-copy.ps1 -ClonePath "C:\work\iparkadmin-tennis-reservation"
   ```

4. GitHub の `iparkadmin/tennis-reservation` の `main` が更新されれば、Vercel **muramatsus-projects / tennis-reservation** がデプロイを取りにいく（Git 連携済みの場合）。

**注意**

- コピーは **ミラーではない**（`/E` のみ）。vault 側で削除したファイルが clone 側に残る場合は、clone 側で `git rm` などして整理する。
- `git pull --ff-only origin main` が失敗する場合は、clone 先の `main` が分岐している。手動で `main` を整えてから再実行する。

---

**注意**: `.github/workflows/` を含む push には、PAT に **workflow** スコープが必要です。GitHub → Settings → Developer settings → Personal access tokens で、対象トークンに `workflow` を付与してください。

---

## 概要

| 項目 | 内容 |
|------|------|
| **仕組み** | GitHub Actions が週2回（日曜・水曜 09:00 UTC）、**PostgreSQL に直接接続**（`psql`）して `SELECT 1` を実行（リポジトリルートのワークフロー） |
| **消費リソース** | GitHub Actions の無料枠内（月あたり数分程度） |
| **ワークフロー** | `.github/workflows/tennis-supabase-keep-alive.yml`（**vault リポジトリのルート**） |

必要な Secrets: `TENNIS_ORIGIN_DATABASE_URL`（およびコピー環境用の `TENNIS_COPY_DATABASE_URL`）。値は Supabase Dashboard → Settings → Database → Connection string (URI)。

---

## セットアップ手順

### Step 1: GitHub リポジトリの Settings を開く

1. **vault リポジトリ**（元環境）の場合: https://github.com/TatsuhitoDT/vault  
2. **iparkadmin/tennis-reservation**（コピー環境）の場合: 該当リポジトリの Settings

### Step 2: Secrets を追加

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### 元環境（vault リポジトリ）の場合（現行ワークフロー: 直接 PostgreSQL）

| Secret 名 | 値 | 取得元 |
|-----------|-----|--------|
| `TENNIS_ORIGIN_DATABASE_URL` | Connection string（URI） | Supabase → Settings → Database → Connection string |

コピー環境も同じワークフローで ping する場合は `TENNIS_COPY_DATABASE_URL` を追加。

#### コピー環境（iparkadmin リポジトリ）の場合

単体リポジトリで別ワークフローを置いている場合は、そのリポジトリのドキュメントに従う。

#### 元環境も iparkadmin から一括実行する場合

（従来の REST + anon キー方式の説明がドキュメントに残っている場合は、リポジトリの最新の `.github/workflows` を正とする。）

### Step 3: コピー環境（iparkadmin）でワークフローを利用する場合

コピー環境は **iparkadmin/tennis-reservation** という**別リポジトリ**です。次のいずれかが必要です。

- **A. vault から一括実行**  
  vault リポジトリのルートワークフローで、元・コピー両方の DB に keep-alive を送る。

- **B. iparkadmin リポジトリで個別に実行**  
  iparkadmin 側にワークフローを配置し、該当 Secrets を設定する。

---

## 動作確認

1. リポジトリの **Actions** タブを開く
2. **Tennis Reservation - Supabase Keep Alive** を選択
3. **Run workflow** から手動実行
4. 実行が成功（緑のチェック）になることを確認

---

## 補足

### なぜ「URL にアクセスするだけ」では不十分か

Supabase は「実際の DB クエリ」が発生しないとアクティビティとしてカウントしません。**PostgreSQL への直接接続**でクエリを発行する方式にしています（リポジトリルートのワークフロー参照）。

---

*最終更新: 2026年3月*
