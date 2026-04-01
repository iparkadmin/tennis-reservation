# iparkadmin 名義の Blocked Preview を止める（元環境・`TatsuhitoDT/vault`）

タイムラインでは **先に** **Author: iparkadmin**・**Preview**・**Blocked** の行が出て、その **あとに** **TatsuhitoDT** の **Production** が動く、という並びになることがある。

## 判明した真の原因（2026-04 調査済み）

**ローカルの `git config user.email` が iparkadmin の GitHub アカウントに紐づくメールアドレスになっていた。**

| メールアドレス | 紐づく GitHub アカウント |
|---|---|
| `tatsuhito.muramatsu@iparkinstitute.com` | **iparkadmin**（→ Blocked の原因） |
| `muramatsu@dragon-tech.biz` | **TatsuhitoDT**（→ Production 成功） |

### 何が起きていたか

```
① ブランチ push（作業コミット = author: iparkadmin メール）
    → Vercel が Preview デプロイを試みる
    → iparkadmin は Vercel チームメンバーでない → Blocked ×4

② main への PR マージ（merge commit = author: TatsuhitoDT メール）
    → Vercel が Production デプロイ → 成功 ×4
```

- Vercel は **コミットの author メール** を GitHub アカウントに照合し、Vercel チームメンバーか判定する。
- 1 回の push でも **ブランチコミット（iparkadmin）→ マージコミット（TatsuhitoDT）** の順にデプロイが積まれるため、「iparkadmin が先、TatsuhitoDT が後」という並びになっていた。
- git remote・Vercel 接続・GitHub App のインストール数はすべて正常（1件のみ）であり、これらは原因ではなかった。

## 解決方法

vault リポジトリのローカル設定を TatsuhitoDT のメールに統一する：

```bash
git config user.email "muramatsu@dragon-tech.biz"
```

- `--global` なし = vault リポジトリのみに適用。他のリポジトリは変更されない。
- コピー環境（`iparkadmin/tennis-reservation`）も push アクターは iparkadmin の PAT のままなのでデプロイに影響なし。

### 再発確認方法

```bash
git log --format="%h %an %ae %s" -5
```

`user.email` が `tatsuhito.muramatsu@iparkinstitute.com`（iparkadmin）に戻っていたら再設定する。

## 誤った対処（効果なし・試行済み）

以下はすべて確認済みで問題なし。原因ではないため対処しても解消しない：

- Vercel → Settings → Git の Connected Git Repository の再接続（4プロジェクト全件確認済）
- GitHub → `TatsuhitoDT/vault` → Webhooks（0件）
- GitHub → `TatsuhitoDT/vault` → Installed GitHub Apps（Vercel 1件のみ）
- iparkadmin の GitHub App の Repository access（`iparkadmin/tennis-reservation` のみ）
- iparkadmin が TatsuhitoDT/vault のコラボレーターか（なし）
- git remote -v（`origin` に iparkadmin 認証情報なし）

## AI・ローカル操作で守ること

- vault リポジトリで作業するときは `git config user.email` が **`muramatsu@dragon-tech.biz`** であることを確認する。
- **`TatsuhitoDT/vault` へは `git push origin …`（`TatsuhitoDT`／`gh` の認証）だけにする。**
- **コピー環境**の push は **`iparkadmin/tennis-reservation`** のみ（`publish-iparkadmin-copy.ps1` 使用）。

## コピー環境への push が subtree で通らない場合

GitHub Push Protection が vault 履歴内の秘密情報を検知してブロックすることがある（subtree push はモノレポ履歴ごと送るため）。その場合は `publish-iparkadmin-copy.ps1`（ファイル同期方式）を使う：

```powershell
# iparkadmin/tennis-reservation を別ディレクトリに clone してから実行
.\tennis-reservation\scripts\publish-iparkadmin-copy.ps1 -ClonePath "C:\work\iparkadmin-tennis-reservation"
```

## 参照

- 環境の表: [ENVIRONMENT_WORKFLOW_RULE.md](./ENVIRONMENT_WORKFLOW_RULE.md)
- Git 連携の初回: [GIT_VERCEL_DEPLOY.md](./GIT_VERCEL_DEPLOY.md)
