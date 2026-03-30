# Supabase Micro Compute 向け SQL 設計プロンプト（tennis-reservation 用）

**プロンプト本文（全アプリ共通）:** [../../docs/app/SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md](../../docs/app/SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md) を参照。  
vault 内の **すべてのアプリ** で Supabase の SQL を作成・改修するときは、そのプロンプトに【アプリ要件】を埋めてから実行する。

---

## テニスコート予約での【アプリ要件】例

このプロジェクト用に【アプリ要件】を埋めた例。新しい SQL を作る際は、上記共通プロンプトの【アプリ要件】を以下で差し替えて使う。

```
【アプリ要件】
- エンティティ: 会員(profiles↔auth.users)、予約(reservations)、コート(courts)。マルチテナントなし（単一施設）。
- 想定規模: MAU 〜500、同時接続 〜20、予約 〜5件/日増加。
- 主要画面: 予約カレンダー一覧、予約詳細、予約作成/更新/キャンセル、マイページ予約一覧、コート別空き確認。
- アクセス制御: 未認証は予約作成不可。認証ユーザーは自分の予約のみ参照/更新/削除。全員がコート一覧・空き状況は参照可。
- レポート/集計: 管理用の件数・集計は同期で軽いもののみ（例: 今月の予約数）。重い集計は不要。
- 既存: profiles, reservations, courts テーブルあり。RLS・インデックス・Function/Trigger は上記制約で見直し可能。
```

---

*Supabase Project: tennis court reservation — 共通プロンプト: `docs/app/SUPABASE_MICRO_COMPUTE_SQL_PROMPT.md`*
