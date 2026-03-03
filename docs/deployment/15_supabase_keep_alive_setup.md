# Supabase Keep Alive セットアップガイド

Supabase 無料プランでは、**7日間アクティビティがない**とプロジェクトがポーズし、その後削除される可能性があります。このガイドでは、GitHub Actions で定期的に DB にアクセスし、ポーズを防ぐ仕組みのセットアップ方法を説明します。

---

## 概要

| 項目 | 内容 |
|------|------|
| **仕組み** | GitHub Actions が週2回（日曜・水曜 09:00 UTC）、Supabase REST API 経由で `reservations` テーブルへ軽量な SELECT を実行 |
| **消費リソース** | GitHub Actions の無料枠内（月あたり数分程度） |
| **ワークフロー** | `vault/.github/workflows/tennis-supabase-keep-alive.yml` |

---

## セットアップ手順

### Step 1: GitHub リポジトリの Settings を開く

1. **vault リポジトリ**（元環境）の場合: https://github.com/TatsuhitoDT/vault  
2. **iparkadmin/tennis-reservation**（コピー環境）の場合: 該当リポジトリの Settings

### Step 2: Secrets を追加

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### 元環境（vault リポジトリ）の場合

| Secret 名 | 値 | 取得元 |
|-----------|-----|--------|
| `TENNIS_ORIGIN_SUPABASE_URL` | Project URL（`https://xxxx.supabase.co`） | Supabase ダッシュボード → Settings → API |
| `TENNIS_ORIGIN_SUPABASE_ANON_KEY` | anon (public) キー | 同上 |

#### コピー環境（iparkadmin リポジトリ）の場合

| Secret 名 | 値 | 取得元 |
|-----------|-----|--------|
| `TENNIS_COPY_SUPABASE_URL` | Project URL（`https://xxxx.supabase.co`） | Supabase ダッシュボード → Settings → API |
| `TENNIS_COPY_SUPABASE_ANON_KEY` | anon (public) キー | 同上 |

### Step 3: コピー環境（iparkadmin）でワークフローを利用する場合

コピー環境は **iparkadmin/tennis-reservation** という**別リポジトリ**です。次のいずれかが必要です。

- **A. vault から一括実行**  
  vault リポジトリに `TENNIS_COPY_SUPABASE_URL` と `TENNIS_COPY_SUPABASE_ANON_KEY` を追加すると、vault のワークフローからコピー環境にも ping を送れます。

- **B. iparkadmin リポジトリで個別に実行**  
  `tennis-reservation/.github/workflows/` にワークフローがあります。iparkadmin へ push 後、iparkadmin リポジトリの Settings で以下を追加してください。

  | Secret 名 | 値 |
  |-----------|-----|
  | `SUPABASE_URL` | コピー環境の Project URL |
  | `SUPABASE_ANON_KEY` | コピー環境の anon キー |

---

## 動作確認

1. リポジトリの **Actions** タブを開く
2. **Tennis Reservation - Supabase Keep Alive** を選択
3. **Run workflow** から手動実行
4. 実行が成功（緑のチェック）になることを確認

---

## オプション：ジョブの無効化

特定の環境だけ keep-alive を止めたい場合は、リポジトリ **Variables** で以下を設定します。

| Variable 名 | 値 | 効果 |
|-------------|-----|------|
| `TENNIS_KEEP_ALIVE_ORIGIN` | `false` | 元環境の keep-alive をスキップ |
| `TENNIS_KEEP_ALIVE_COPY` | `false` | コピー環境の keep-alive をスキップ |

---

## 補足

### なぜ「URL にアクセスするだけ」では不十分か

Supabase は「実際の DB クエリ」が発生しないとアクティビティとしてカウントしません。REST API 経由で `reservations` テーブルへ `SELECT` を実行することで、DB アクティビティを記録します。

### reservations テーブルを使う理由

`reservations` には「Anyone can view」（anon キーで閲覧可能）の RLS ポリシーがあるため、認証なしで軽量な SELECT を実行できます。

---

*最終更新: 2025年3月*
