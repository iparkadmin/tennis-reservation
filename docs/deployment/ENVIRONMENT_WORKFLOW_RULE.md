# 環境別作業ルール（tennis-reservation）

> AI アシスタントおよび開発者向け。指示の解釈と作業対象を統一するためのルール。
> **作業前は本ルールを確認し、対象環境を間違えないこと。**

---

## 基本方針

- **通常**: コピー環境を更新する
- **元環境を更新する場合**: 指示で「元環境」と明示する

---

## 元環境

| サービス | URL |
|----------|-----|
| GitHub | https://github.com/TatsuhitoDT/vault |
| Supabase | https://supabase.com/dashboard/org/dfiufvdhbtaitktitzwh |
| Vercel | https://vercel.com/mtatsuhito-gmailcoms-projects |

- リポジトリ: vault モノレポ内の tennis-reservation

---

## コピー環境

| サービス | URL |
|----------|-----|
| GitHub | https://github.com/iparkadmin |
| Supabase | https://supabase.com/dashboard/org/qtgzpqlzgojkjwsigvww |
| Vercel | https://vercel.com/muramatsus-projects |

- リポジトリ: iparkadmin/tennis-reservation（単独）

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
| Vercel | mtatsuhito-gmailcoms-projects | muramatsus-projects |
| Supabase | org/dfiufvdhbtaitktitzwh | org/qtgzpqlzgojkjwsigvww |
| Git push | vault リポジトリ | iparkadmin/tennis-reservation |

---

## 関連ルール

- `.cursor/rules/environment-workflow.mdc` に同内容の Cursor ルールあり
