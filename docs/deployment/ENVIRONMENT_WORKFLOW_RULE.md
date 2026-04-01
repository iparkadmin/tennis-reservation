# 環境別作業ルール（tennis-reservation）

> AI アシスタントおよび開発者向け。指示の解釈と作業対象を統一するためのルール。
> **作業前は本ルールを確認し、対象環境を間違えないこと。**

---

## 基本方針

- **通常**: コピー環境を更新する
- **元環境を更新する場合**: 指示で「元環境」と明示する
- **コピー環境への反映は iparkadmin 経由**: 元環境（`TatsuhitoDT/vault`）と役割を分けたうえで、**公開用コピーへ載せる変更は必ず `iparkadmin/tennis-reservation` に push する**。別の GitHub アカウント／別リポジトリだけを更新してコピー環境のデプロイを代替しない（Vercel・Supabase のペアがずれる）。

---

## GitHub ↔ Vercel の公式ペア（入れ替え禁止）

| 環境 | GitHub | Vercel |
|------|--------|--------|
| **元環境** | https://github.com/TatsuhitoDT/vault | チーム https://vercel.com/mtatsuhito-gmailcoms-projects（この vault 向けに接続しているプロジェクト） |
| **コピー環境** | https://github.com/iparkadmin/tennis-reservation | https://vercel.com/muramatsus-projects/tennis-reservation |

**vault を muramatsus に、iparkadmin/tennis-reservation を mtatsuhito-gmailcoms に繋ぐのは誤り。** デプロイや環境変数が別 Supabase を指す原因になる。

---

## 元環境

| サービス | URL |
|----------|-----|
| GitHub | https://github.com/TatsuhitoDT/vault |
| Supabase | https://supabase.com/dashboard/org/dfiufvdhbtaitktitzwh |
| Vercel | https://vercel.com/mtatsuhito-gmailcoms-projects |

- アプリの場所: vault モノレポ内の **`tennis-reservation/`**（Vercel の Root Directory は **`tennis-reservation`**）

---

## コピー環境

| サービス | URL |
|----------|-----|
| GitHub | https://github.com/iparkadmin/tennis-reservation |
| Supabase | https://supabase.com/dashboard/org/qtgzpqlzgojkjwsigvww |
| Vercel | https://vercel.com/muramatsus-projects/tennis-reservation |

- リポジトリ: **単独** `iparkadmin/tennis-reservation`（vault モノレポではない）。Vercel の Root はリポジトリ構成に合わせる（`06_vercel_deployment_guide.md`・README の単独向け記述参照）。
- **push 先の固定**: コピー環境＝このリポジトリの **`main`（または運用で決めた本番ブランチ）** へ。**元環境用の `origin`（vault）への push だけではコピー環境の本番は更新されない。**

---

## 指示の解釈（AI アシスタント用）

| 指示の内容 | 作業対象 |
|------------|----------|
| 環境の指定なし | **コピー環境** |
| 「元環境で」「元環境に」「元環境を」など | **元環境** |
| 「コピー環境で」 | コピー環境 |
| 「両方」 | 両方の環境 |

---

## 適用範囲・Git push 先

| 作業種別 | 元環境 | コピー環境 |
|----------|--------|------------|
| Vercel | `vercel.com/mtatsuhito-gmailcoms-projects`（vault 接続プロジェクト） | `vercel.com/muramatsus-projects/tennis-reservation` |
| Supabase | org/dfiufvdhbtaitktitzwh | org/qtgzpqlzgojkjwsigvww |
| Git push | `TatsuhitoDT/vault` | `iparkadmin/tennis-reservation` |

---

## Vercel 環境変数（4キー）の復旧・再発防止

設定が別環境の Supabase や別 URL に**書き換わってしまった**場合は、次を正とする。

- **[VERCEL_FOUR_KEYS_RECOVERY_AND_PREVENTION.md](./VERCEL_FOUR_KEYS_RECOVERY_AND_PREVENTION.md)** — 4 つの環境変数の正しい入れ方、Supabase Auth との整合、再発防止

---

## 関連ルール

- `.cursor/rules/environment-workflow.mdc` に同内容の Cursor ルールあり（プロジェクトに存在する場合）
