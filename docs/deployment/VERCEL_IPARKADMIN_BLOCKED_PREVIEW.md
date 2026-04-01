# iparkadmin 名義の Blocked Preview を止める（元環境・`TatsuhitoDT/vault`）

タイムラインでは **先に** **Author: iparkadmin**・**Preview**・**Blocked** の行が出て、その **あとに** **TatsuhitoDT** の **Production** が動く、という並びになることがある。困るのは **余計な第一系統（iparkadmin 側）** であり、「謎の第二プッシュ」ではなく **謎の第一プッシュ／第一系統** と捉えると運用と一致しやすい。

## 原因（リポジトリに「無意味な push」が増えているわけではないことが多い）

- `TatsuhitoDT/vault` への **通常の 1 回の push** で、GitHub は **1 本の webhook** を Vercel に送る。
- 一方で、**同じリポジトリを Vercel が別の GitHub 接続（例: iparkadmin アカウントで入れた GitHub App／二重 Import）でも見ている**と、**同じコミットに対して iparkadmin 名義の Preview ビルド**がもう一系統キューに入る。
- **Hobby プランや権限**の都合で、その系統だけ **Blocked** になることがある。**本番（TatsuhitoDT・`main`）とは別ライン**。

→ **「iparkadmin 用に余計な push をする」のをやめれば止まる」タイプではなく、「Vercel／GitHub 側の接続を一本化する」タイプの対処が効く。

## 対処（元環境の各 Vercel プロジェクトごと）

1. [Vercel](https://vercel.com) → **該当プロジェクト**（例: `tennis-reservation`）→ **Settings** → **Git**
2. **Connected Git Repository** が **`TatsuhitoDT/vault`** であることを確認する。
3. **iparkadmin で入れた古い接続**や、同じ repo が二重に見えている場合は **Disconnect** する。
4. ブラウザで **TatsuhitoDT** にログインした状態で **Reconnect** / **Import** し直し、OAuth は **`TatsuhitoDT`**（および必要なら org）だけで完了させる。**iparkadmin で Vercel に vault を再接続しない**（コピー用は別プロジェクトで `iparkadmin/tennis-reservation` のみ）。

### GitHub 側（任意だが有効）

5. GitHub → **`TatsuhitoDT/vault`** → **Settings** → **Integrations**（または **GitHub Apps**）
6. **Vercel** 関連で、**iparkadmin 権限で余分に入っているインストール**があれば削除または権限を整理する。

## AI・ローカル操作で守ること（余計なトリガを増やさない）

- **`TatsuhitoDT/vault` へは `git push origin …`（`TatsuhitoDT`／`gh` の認証）だけにする。**  
  **`https://iparkadmin:TOKEN@github.com/TatsuhitoDT/vault.git` のように iparkadmin 用 PAT を vault の remote に埋めて push しない**（Webhook の見え方がずれる原因になりうる）。
- **コピー環境**の push は **`iparkadmin/tennis-reservation`** のみ（別リポジトリ・別 Vercel プロジェクト）。

## 参照

- 環境の表: [ENVIRONMENT_WORKFLOW_RULE.md](./ENVIRONMENT_WORKFLOW_RULE.md)
- Git 連携の初回: [GIT_VERCEL_DEPLOY.md](./GIT_VERCEL_DEPLOY.md)
