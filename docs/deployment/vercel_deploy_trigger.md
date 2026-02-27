# Vercel デプロイの手動トリガー手順

## 現在の状態確認

- **最新コミット**: `2332244` (chore: trigger deploy)
- **リモート**: GitHub `main` にプッシュ済み
- **Git 連携**: プッシュは成功している

## デプロイが自動で走らない場合の原因と対処

### 1. GitHub ウェブフックの不具合

**症状**: プッシュしても Vercel にデプロイが開始されない

**対処**:
1. [Vercel ダッシュボード](https://vercel.com/dashboard) でプロジェクトを開く
2. **Settings** → **Git** を開く
3. **Disconnect** でリポジトリを一度切断
4. **Connect Git Repository** で再接続

### 2. 本番ブランチの不一致

**確認**: Settings → Git で **Production Branch** が `main` になっているか確認

### 3. デプロイ制限（無料プラン）

以前「100 deployments per day」制限に達したことがあります。制限がリセットされるまで待つか、有料プランへ移行してください。

### 4. Deploy Hook で手動トリガー（推奨）

Git 連携に頼らず、HTTP リクエストでデプロイを開始できます。

#### 手順

1. Vercel ダッシュボード → プロジェクト → **Settings** → **Git**
2. **Deploy Hooks** セクションで「Create Hook」をクリック
3. 名前（例: `manual-deploy`）、ブランチ（`main`）を指定して作成
4. 表示された URL をコピー
5. 以下のコマンドでデプロイをトリガー:

```powershell
Invoke-WebRequest -Uri "ここにDeploy HookのURLを貼り付け" -Method POST
```

または curl が使える場合:

```bash
curl -X POST "Deploy HookのURL"
```

#### スクリプト化

環境変数 `VERCEL_DEPLOY_HOOK_URL` に Deploy Hook URL を設定し、以下を実行:

```powershell
# .env.local や 環境変数に VERCEL_DEPLOY_HOOK_URL を設定してから
$url = $env:VERCEL_DEPLOY_HOOK_URL
if ($url) {
  Invoke-WebRequest -Uri $url -Method POST
  Write-Host "Deploy triggered."
} else {
  Write-Host "Set VERCEL_DEPLOY_HOOK_URL first."
}
```

### 5. ダッシュボードから手動 Redeploy

1. Vercel ダッシュボード → プロジェクト → **Deployments**
2. 最新のデプロイの **︙** メニュー → **Redeploy**
3. 「Clear Build Cache」にチェックを入れるとクリーンビルドになる

---

## 確認チェックリスト

- [ ] GitHub で `main` に最新コミットがプッシュされている
- [ ] Vercel の Git 連携が有効
- [ ] Production Branch が `main`
- [ ] デプロイ制限に達していない
- [ ] Deploy Hooks を設定済み（手動トリガー用）
