# Supabase Service Role Key 設定ガイド

## service_roleキーの取得方法

### Step 1: Supabaseダッシュボードにアクセス

1. **Supabaseにログイン**
   - https://supabase.com/dashboard を開く
   - プロジェクト **「tennis court reservation」** を選択

### Step 2: Settings画面を開く

1. 左サイドバー下部の **歯車アイコン（⚙️）** をクリック
2. **「Project Settings」** をクリック

### Step 3: API Keys画面を開く

1. 左メニューの **「PROJECT SETTINGS」** セクションから
2. **「API」** または **「API Keys」** をクリック
   - 「General」の下、「Data API」「JWT Keys」の近くにあります

### Step 4: service_roleキーをコピー

1. **「Project API keys」** の表を確認
2. **「service_role」** で **「secret」** と書いてある行を探す
3. キーが隠れている場合は、**「Reveal」** ボタンまたは **目のアイコン（👁️）** をクリック
4. 長いキー文字列（`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.` で始まるJWT）をコピー

### Step 5: Vercelに環境変数として設定

1. **Vercelダッシュボード** → プロジェクト **「tennis-court-reservation-app」** を選択
2. **「Settings」** タブ → **「Environment Variables」** をクリック
3. 以下の環境変数を追加：

| 項目 | 値 |
|------|-----|
| **Key** | `SUPABASE_SERVICE_ROLE_KEY` |
| **Value** | コピーしたservice_roleキー |
| **Environment** | Production, Preview, Development（すべてチェック） |

### Step 6: 再デプロイ

1. **「Deployments」** タブに移動
2. 最新のデプロイの **「...」** メニュー → **「Redeploy」**
3. **「Use existing Build Cache」** のチェックを外す（推奨）
4. **「Redeploy」** をクリック

---

## ⚠️ 重要な注意事項

- **service_roleキーは秘密情報**です。絶対にクライアント側のコードに露出させないでください
- このキーは**サーバー側（API Route）でのみ使用**されます
- キーが漏洩した場合は、Supabaseダッシュボードから再生成してください

---

## 動作確認

環境変数を設定して再デプロイ後：

1. アカウント削除機能を実行
2. Supabaseダッシュボードで以下を確認：
   - **Authentication** → **Users**: ユーザーが削除されている
   - **Table Editor** → **profiles**: プロフィールが削除されている
   - **Table Editor** → **reservations**: 予約が削除されている
3. 同じメールアドレスで再登録できることを確認

---

*最終更新: 2025年1月*
