# 自動送付メール一覧

> **目的：** テニスコート予約システムの運用において、ユーザーに自動送付すべきメールの完全なリスト

---

## 📧 メール送付一覧

### 1. 認証関連メール

#### 1.1 新規登録時のメール認証
- **トリガー：** ユーザーが新規登録を完了した時
- **送信先：** 登録したメールアドレス
- **送信タイミング：** 即時
- **送信元：** ✅ **Supabase Auth**（自動送信）
- **実装状況：** ✅ 実装済み（Supabase Auth標準機能）
- **件名例：** `【テニスコート予約システム】メールアドレスの確認をお願いします`
- **内容：**
  - メール認証リンク
  - 認証手順の説明
  - 認証リンクの有効期限（通常24時間）
  - 注意事項（リンクをクリックしないとログインできない旨）

#### 1.2 パスワードリセットメール
- **トリガー：** ユーザーが「パスワードを忘れた場合」からリセットリクエストを送信した時
- **送信先：** 登録済みメールアドレス
- **送信タイミング：** 即時
- **送信元：** ✅ **Supabase Auth**（自動送信）
- **実装状況：** ✅ 実装済み（Supabase Auth標準機能）
- **件名例：** `【テニスコート予約システム】パスワードリセットのご案内`
- **内容：**
  - パスワードリセットリンク
  - リセット手順の説明
  - リンクの有効期限（通常1時間）
  - セキュリティ注意事項（本人以外がリクエストした場合の対応方法）

---

### 2. 予約関連メール（未実装）

#### 2.1 予約完了確認メール（会員）
- **トリガー：** 会員が予約を完了した時
- **送信先：** 会員の登録メールアドレス
- **送信タイミング：** 即時
- **送信元：** **Next.js API Routes + 外部メールサービス**（Resend/SendGrid等）
- **実装状況：** ❌ **未実装**（ユーザー登録周りのみ実装）
- **件名例：** `【テニスコート予約システム】予約が完了しました`
- **内容：**
  - 予約番号（重要）
  - 予約日時（日付、開始時間、終了時間）
  - 予約者情報（氏名）
  - 連絡事項（入力されている場合）
  - 予約詳細確認ページへのリンク
  - キャンセル可能期限（前日まで）
  - 注意事項（当日キャンセル不可、利用規約へのリンク）

#### 2.2 予約完了確認メール（ゲスト）
- **トリガー：** ゲストが予約を完了した時
- **送信先：** ゲストが入力したメールアドレス
- **送信タイミング：** 即時
- **送信元：** **Next.js API Routes + 外部メールサービス**（Resend/SendGrid等）
- **実装状況：** ❌ **未実装**（ユーザー登録周りのみ実装）
- **件名例：** `【テニスコート予約システム】予約が完了しました（ゲスト予約）`
- **内容：**
  - 予約番号（重要）
  - 予約日時（日付、開始時間、終了時間）
  - 予約者情報（氏名）
  - 連絡事項（入力されている場合）
  - キャンセル可能期限（前日まで）
  - 注意事項（当日キャンセル不可、利用規約へのリンク）
  - **ゲスト予約のため、マイページでの確認・変更は不可である旨**

---

### 3. 予約変更・キャンセル関連メール（MVP）

#### 3.1 予約変更確認メール
- **トリガー：** ユーザーが予約の日時を変更した時
- **送信先：** 会員の登録メールアドレス（ゲスト予約は変更不可のため対象外）
- **送信タイミング：** 即時
- **送信元：** ⚠️ **Next.js API Routes + 外部メールサービス**（Resend/SendGrid等）
- **実装状況：** ❌ 未実装（要追加）
- **件名例：** `【テニスコート予約システム】予約が変更されました`
- **内容：**
  - 予約番号（変更前と同じ）
  - **変更前の予約日時**
  - **変更後の予約日時**（強調表示）
  - 予約者情報
  - 変更日時
  - 予約詳細確認ページへのリンク
  - 注意事項（再度の変更は前日まで可能）

#### 3.2 予約キャンセル確認メール
- **トリガー：** ユーザーが予約をキャンセルした時
- **送信先：** 会員の登録メールアドレス、またはゲストのメールアドレス
- **送信タイミング：** 即時
- **送信元：** ⚠️ **Next.js API Routes + 外部メールサービス**（Resend/SendGrid等）
- **実装状況：** ❌ 未実装（要追加）
- **件名例：** `【テニスコート予約システム】予約がキャンセルされました`
- **内容：**
  - 予約番号
  - キャンセルされた予約日時
  - 予約者情報
  - キャンセル日時
  - キャンセル理由（入力されている場合）
  - 注意事項（キャンセル後の再予約方法、利用規約へのリンク）

---

### 4. リマインドメール（正規版・n8n自動通知）

#### 4.1 予約前日リマインドメール
- **トリガー：** 予約日の前日（自動）
- **送信先：** 会員の登録メールアドレス、またはゲストのメールアドレス
- **送信タイミング：** 予約日の前日（例：予約日が1月16日の場合、1月15日に送信）
- **送信元：** ⚠️ **n8n + 外部メールサービス**（Resend/SendGrid等）
- **実装状況：** ⚠️ 正規版機能（n8n自動通知として計画）
- **件名例：** `【テニスコート予約システム】明日の予約について（リマインド）`
- **内容：**
  - 予約番号
  - **予約日時（明日）**（強調表示）
  - 予約者情報
  - 連絡事項（入力されている場合）
  - 予約詳細確認ページへのリンク（会員のみ）
  - キャンセル可能期限（当日0時まで）
  - 注意事項（天候による中止の場合の連絡方法、利用規約へのリンク）

---

### 5. システム通知メール（正規版）

#### 5.1 雨天中止の一斉通知メール
- **トリガー：** 管理者が雨天中止を設定した時（手動または自動）
- **送信先：** 該当日に予約がある全ユーザー（会員・ゲスト）
- **送信タイミング：** 管理者が設定した時点
- **送信元：** ⚠️ **n8n + 外部メールサービス**（Resend/SendGrid等）
- **実装状況：** ⚠️ 正規版機能（n8n自動通知として計画）
- **件名例：** `【テニスコート予約システム】【重要】雨天のため予約が中止となりました`
- **内容：**
  - **重要：雨天のため予約が中止**（強調表示）
  - 対象予約日
  - 予約番号
  - 予約日時（開始時間、終了時間）
  - 予約者情報
  - 中止理由（雨天）
  - 再予約方法
  - 問い合わせ先
  - 注意事項（自動キャンセル処理、再予約の優先権など）

---

## 📋 メール送付マトリックス

| メール種類 | 送信タイミング | 送信先 | 実装状況 | 優先度 |
|-----------|--------------|--------|---------|--------|
| **認証関連** |
| 新規登録時のメール認証 | 即時 | 新規登録者 | ✅ 実装済み | 高 |
| パスワードリセット | 即時 | リセット申請者 | ✅ 実装済み | 高 |
| **予約関連（未実装）** |
| 予約完了確認（会員） | 即時 | 会員 | ❌ 未実装 | 中 |
| 予約完了確認（ゲスト） | 即時 | ゲスト | ❌ 未実装 | 中 |
| 予約変更確認 | 即時 | 会員 | ❌ 未実装 | 中 |
| 予約キャンセル確認 | 即時 | 会員・ゲスト | ❌ 未実装 | 中 |
| **リマインド（正規版）** |
| 予約前日リマインド | 予約日の前日 | 会員・ゲスト | ⚠️ 正規版 | 中 |
| **システム通知（正規版）** |
| 雨天中止通知 | 管理者設定時 | 該当予約者全員 | ⚠️ 正規版 | 高 |

---

## 🎯 実装優先順位

### Phase 1: MVP必須メール（最優先）

1. ✅ **新規登録時のメール認証** - 実装済み（Supabase Auth）
2. ✅ **パスワードリセットメール** - 実装済み（Supabase Auth）

### Phase 2: MVP推奨メール（未実装）

3. ❌ **予約完了確認メール（会員・ゲスト）** - 未実装（ユーザー登録周りのみ実装）
4. ❌ **予約変更確認メール** - 未実装
5. ❌ **予約キャンセル確認メール** - 未実装

### Phase 3: 正規版メール（n8n自動通知・未実装）

6. ❌ **予約前日リマインドメール** - 未実装（n8n自動通知として計画）
7. ❌ **雨天中止の一斉通知メール** - 未実装（n8n自動通知として計画）

---

## 📌 現在の実装状況

**実装済み：認証関連メールのみ**
- ✅ 新規登録時のメール認証（Supabase Auth）
- ✅ パスワードリセットメール（Supabase Auth）

**未実装：予約関連メール**
- ❌ 予約完了確認メール（会員・ゲスト）
- ❌ 予約変更確認メール
- ❌ 予約キャンセル確認メール
- ❌ 予約前日リマインドメール
- ❌ 雨天中止の一斉通知メール

---

## ⚠️ 利用者へのお知らせ（メールが送付されないことの喚起）

**予約の完了・変更・キャンセル時にはメール通知を送信していません。**  
利用者に混乱が生じないよう、以下の画面上にその旨の注意文を表示しています。

| 画面 | 表示内容 |
|------|----------|
| 予約カレンダー（dashboard） | 「予約の完了・変更・キャンセル時にメール通知は送信されません。内容はマイページ・予約履歴でご確認ください。」 |
| 予約履歴（member/reservations） | 「予約の完了・変更・キャンセル時にメール通知は送信されません。」 |
| 予約詳細（member/reservations/[id]） | 詳細表示：「予約の変更・キャンセル時にメール通知は送信されません。」／ 変更モード：「変更確定後もメール通知は送信されません。予約履歴でご確認ください。」 |
| マイページ（マイ予約タブ） | 「予約の完了・変更・キャンセル時にメール通知は送信されません。内容は予約履歴でご確認ください。」 |

---

## 📝 メールテンプレート設計の注意事項

### 必須要素

すべてのメールに含めるべき要素：

1. **送信元名：** `テニスコート予約システム` または `iPark Institute Co., Ltd.`
2. **送信元メールアドレス：** `noreply@tennis-court-reservation.example.com`（実際のドメインに置き換え）
3. **フッター：**
   - 運営会社名：`iPark Institute Co., Ltd.`
   - 問い合わせ先（メールアドレス、電話番号）
   - 利用規約へのリンク
   - プライバシーポリシーへのリンク（ある場合）

### デザイン要件

- **レスポンシブ対応：** スマートフォンでも読みやすいHTMLメール
- **ブランディング：** システムのロゴ、カラーパレット（Material Design 3）を使用
- **アクセシビリティ：** テキスト版も用意（HTMLメールと併用）

### セキュリティ要件

- **個人情報保護：** メール本文に機密情報を含めない（予約番号は除く）
- **リンクの安全性：** HTTPS必須、リンクの有効期限を明示
- **スパム対策：** SPF、DKIM、DMARCレコードの設定

---

## 🔧 実装方法と送信元

### 送信元の分類

#### 1. Supabase Authから自動送信（認証メールのみ）

以下のメールは**Supabase Authの標準機能**により、自動的にSupabaseから送信されます：

- ✅ **新規登録時のメール認証**
- ✅ **パスワードリセットメール**

**特徴：**
- 設定不要で自動送信
- カスタマイズ可能（Supabaseダッシュボードでテンプレート編集）
- 送信元メールアドレスはSupabaseのデフォルトドメイン（例：`noreply@mail.app.supabase.io`）
- カスタムドメインの設定も可能

#### 2. Next.js API Routes + 外部メールサービス（予約関連メール）

以下のメールは**Next.jsのAPI Routes**から、**外部のトランザクションメールサービス**（Resend、SendGrid等）を経由して送信します：

- ⚠️ **予約完了確認メール（会員・ゲスト）**
- ❌ **予約変更確認メール**
- ❌ **予約キャンセル確認メール**

**実装方法：**
- Next.js API Routes（`/api/send-email`等）でメール送信処理を実装
- Resend、SendGrid、Mailgun等のAPIを使用
- 予約完了・変更・キャンセルのタイミングでAPIを呼び出し

**推奨サービス：**

##### 🥇 推奨：Resend

- **URL：** https://resend.com
- **特徴：**
  - シンプルで使いやすいAPI
  - 開発者向けに最適化された設計
  - Next.jsとの統合が容易
  - 無料枠：月3,000通まで
  - 有料プラン：月$20から（月50,000通）
- **選定理由：**
  - モダンなAPI設計で実装が簡単
  - ドキュメントが充実
  - React Emailとの統合が可能
  - カスタムドメイン設定が容易

##### その他の選択肢

- **SendGrid** (https://sendgrid.com)
  - 高機能なメール配信サービス
  - 無料枠：月100通まで
  - 有料プラン：月$19.95から（月50,000通）
  - 豊富な機能（テンプレート、統計、Webhook等）
  
- **Mailgun** (https://www.mailgun.com)
  - 柔軟な設定が可能
  - 無料枠：月5,000通まで（最初の3ヶ月間のみ）
  - 有料プラン：月$35から（月50,000通）
  - 強力なルーティング機能

#### 3. n8n + 外部メールサービス（自動通知メール）

以下のメールは**n8n**の自動化ワークフローから、**外部のトランザクションメールサービス**を経由して送信します：

- ⚠️ **予約前日リマインドメール**（n8nのCronトリガー）
- ⚠️ **雨天中止の一斉通知メール**（n8nのWebhookトリガー）

**実装方法：**
- n8nのワークフローでCronトリガーまたはWebhookトリガーを設定
- Supabaseから予約データを取得
- Resend、SendGrid等のn8nノードでメール送信

### なぜSupabaseから直接送信しないのか？

**Supabaseのメール機能の制限：**
- カスタムメールテンプレートの自由度が低い
- 送信量に制限がある（無料プランでは1日あたり数通程度）
- HTMLメールのデザインカスタマイズが難しい
- 送信ログの詳細な追跡が困難

**外部メールサービスの利点：**
- 高品質なHTMLメールテンプレート
- 大量送信に対応（無料枠でも月数千通）
- 詳細な送信ログ・開封率・クリック率の追跡
- カスタムドメインの設定が容易
- スパム対策（SPF、DKIM、DMARC）の設定が簡単

### 実装の推奨順序

1. **Phase 1（MVP）：** 認証メールはSupabase Authの標準機能を使用（既に実装済み）
2. **Phase 2（MVP）：** 予約関連メールはNext.js API Routes + **Resend**で実装
3. **Phase 3（正規版）：** リマインド・システム通知はn8n + **Resend**で実装

### 外部メールサービスの選定理由

**Resendを推奨する理由：**

1. **開発者体験が優れている**
   - シンプルなREST API
   - TypeScriptの型定義が充実
   - Next.jsとの統合が容易

2. **コストパフォーマンス**
   - 無料枠が月3,000通と実用的
   - 有料プランも比較的安価（月$20から）

3. **実装の容易さ**
   - React Emailとの統合が可能
   - テンプレート管理が簡単
   - カスタムドメイン設定が容易

4. **信頼性**
   - 高い配信率
   - 詳細な送信ログ
   - Webhookによる配信状況の追跡

---

## 📊 メール送信ログ管理

### 推奨事項

- メール送信履歴をデータベースに記録
- 送信失敗時のリトライ機能
- 開封率・クリック率の追跡（オプション）

### データベース設計（オプション）

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'signup_verification', 'reservation_confirmation', etc.
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  reservation_id UUID REFERENCES reservations(id), -- 予約関連メールの場合
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📝 メールテンプレート

### 共通フッター

すべてのメールに含める共通フッター：

```html
<hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
<p style="font-size: 12px; color: #666; line-height: 1.6;">
  <strong>運営会社</strong><br>
  iPark Institute Co., Ltd.<br>
  <br>
  <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
</p>
<p style="font-size: 11px; color: #999; margin-top: 20px;">
  ※このメールは送信専用です。返信はできません。
</p>
```

---

### 1. 新規登録時のメール認証

**件名：** `【テニスコート予約システム】メールアドレスの確認をお願いします`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      この度は、テニスコート予約システムにご登録いただき、誠にありがとうございます。
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      ご登録いただいたメールアドレスを確認するため、以下のリンクをクリックしてください。
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{CONFIRMATION_LINK}}" style="display: inline-block; background-color: #16145F; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        メールアドレスを確認する
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ 重要：</strong><br>
        このリンクは24時間有効です。24時間を過ぎた場合は、再度メール認証のリクエストを行ってください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      もし、このメールに心当たりがない場合は、このメールを無視してください。<br>
      リンクをクリックしない限り、アカウントは有効化されません。
    </p>
    
    <p style="font-size: 14px; color: #666;">
      リンクがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
      <span style="word-break: break-all; color: #0067B1;">{{CONFIRMATION_LINK}}</span>
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 2. パスワードリセットメール

**件名：** `【テニスコート予約システム】パスワードリセットのご案内`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      パスワードリセットのリクエストを受け付けました。
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      以下のリンクをクリックして、新しいパスワードを設定してください。
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{RESET_LINK}}" style="display: inline-block; background-color: #16145F; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
        パスワードをリセットする
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ 重要：</strong><br>
        このリンクは1時間有効です。1時間を過ぎた場合は、再度パスワードリセットのリクエストを行ってください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      もし、このメールに心当たりがない場合は、このメールを無視してください。<br>
      リンクをクリックしない限り、パスワードは変更されません。
    </p>
    
    <p style="font-size: 14px; color: #666;">
      リンクがクリックできない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
      <span style="word-break: break-all; color: #0067B1;">{{RESET_LINK}}</span>
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 3. 予約完了確認メール（会員）

**件名：** `【テニスコート予約システム】予約が完了しました`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #16145F;">
      予約が完了しました
    </p>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      {{FULL_NAME}}様<br>
      <br>
      この度は、テニスコート予約システムをご利用いただき、誠にありがとうございます。<br>
      ご予約が正常に完了いたしました。
    </p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #16145F;">予約内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">予約番号</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E72241;">{{RESERVATION_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約日</td>
          <td style="padding: 8px 0;">{{BOOKING_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">時間</td>
          <td style="padding: 8px 0;">{{START_TIME}} ～ {{END_TIME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約者名</td>
          <td style="padding: 8px 0;">{{FULL_NAME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">電話番号</td>
          <td style="padding: 8px 0;">{{PHONE}}</td>
        </tr>
        {{#if CONTACT_NOTES}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">連絡事項</td>
          <td style="padding: 8px 0;">{{CONTACT_NOTES}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{RESERVATION_DETAIL_URL}}" style="display: inline-block; background-color: #0067B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 14px;">
        予約詳細を確認する
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ キャンセルについて</strong><br>
        予約のキャンセルは、予約日の前日まで可能です。当日のキャンセルはできませんのでご注意ください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 4. 予約完了確認メール（ゲスト）

**件名：** `【テニスコート予約システム】予約が完了しました（ゲスト予約）`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #16145F;">
      予約が完了しました
    </p>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      {{GUEST_NAME}}様<br>
      <br>
      この度は、テニスコート予約システムをご利用いただき、誠にありがとうございます。<br>
      ご予約が正常に完了いたしました。
    </p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #16145F;">予約内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">予約番号</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E72241;">{{RESERVATION_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約日</td>
          <td style="padding: 8px 0;">{{BOOKING_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">時間</td>
          <td style="padding: 8px 0;">{{START_TIME}} ～ {{END_TIME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約者名</td>
          <td style="padding: 8px 0;">{{GUEST_NAME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">電話番号</td>
          <td style="padding: 8px 0;">{{GUEST_PHONE}}</td>
        </tr>
        {{#if CONTACT_NOTES}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">連絡事項</td>
          <td style="padding: 8px 0;">{{CONTACT_NOTES}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="background-color: #e3f2fd; border-left: 4px solid #0067B1; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>ℹ️ ゲスト予約について</strong><br>
        この予約はゲスト予約のため、マイページでの確認・変更はできません。<br>
        予約の変更・キャンセルをご希望の場合は、お問い合わせフォームまたは電話にてご連絡ください。
      </p>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ キャンセルについて</strong><br>
        予約のキャンセルは、予約日の前日まで可能です。当日のキャンセルはできませんのでご注意ください。<br>
        キャンセルをご希望の場合は、お問い合わせフォームまたは電話にてご連絡ください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 5. 予約変更確認メール

**件名：** `【テニスコート予約システム】予約が変更されました`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #16145F;">
      予約が変更されました
    </p>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      {{FULL_NAME}}様<br>
      <br>
      ご予約の変更が正常に完了いたしました。
    </p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #16145F;">変更内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">予約番号</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E72241;">{{RESERVATION_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">変更前</td>
          <td style="padding: 8px 0;">
            {{OLD_BOOKING_DATE}} {{OLD_START_TIME}} ～ {{OLD_END_TIME}}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top; color: #E72241;">変更後</td>
          <td style="padding: 8px 0; font-size: 16px; font-weight: bold; color: #E72241;">
            {{NEW_BOOKING_DATE}} {{NEW_START_TIME}} ～ {{NEW_END_TIME}}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">変更日時</td>
          <td style="padding: 8px 0;">{{CHANGED_AT}}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{RESERVATION_DETAIL_URL}}" style="display: inline-block; background-color: #0067B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 14px;">
        予約詳細を確認する
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ 再度の変更について</strong><br>
        予約の再度の変更は、予約日の前日まで可能です。当日の変更はできませんのでご注意ください。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 6. 予約キャンセル確認メール

**件名：** `【テニスコート予約システム】予約がキャンセルされました`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #16145F;">
      予約がキャンセルされました
    </p>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      {{FULL_NAME}}様<br>
      <br>
      ご予約のキャンセルが正常に完了いたしました。
    </p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #16145F;">キャンセルされた予約内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">予約番号</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E72241;">{{RESERVATION_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約日</td>
          <td style="padding: 8px 0;">{{BOOKING_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">時間</td>
          <td style="padding: 8px 0;">{{START_TIME}} ～ {{END_TIME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約者名</td>
          <td style="padding: 8px 0;">{{FULL_NAME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">キャンセル日時</td>
          <td style="padding: 8px 0;">{{CANCELLED_AT}}</td>
        </tr>
        {{#if CANCELLATION_REASON}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">キャンセル理由</td>
          <td style="padding: 8px 0;">{{CANCELLATION_REASON}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="background-color: #e3f2fd; border-left: 4px solid #0067B1; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>ℹ️ 再予約について</strong><br>
        新しい予約をご希望の場合は、予約カレンダーから再度ご予約ください。<br>
        ご予約は<a href="{{BOOKING_URL}}" style="color: #0067B1;">こちら</a>から可能です。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 7. 予約前日リマインドメール

**件名：** `【テニスコート予約システム】明日の予約について（リマインド）`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #16145F; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">iPark テニスコート予約システム</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #16145F;">
      明日の予約について（リマインド）
    </p>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      {{FULL_NAME}}様<br>
      <br>
      明日、テニスコートのご予約がございます。お忘れのないよう、お知らせいたします。
    </p>
    
    <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <p style="font-size: 20px; font-weight: bold; margin: 0; color: #E72241;">
        {{BOOKING_DATE}}（{{DAY_OF_WEEK}}）<br>
        {{START_TIME}} ～ {{END_TIME}}
      </p>
    </div>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #16145F;">予約内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">予約番号</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E72241;">{{RESERVATION_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約日</td>
          <td style="padding: 8px 0;">{{BOOKING_DATE}}（{{DAY_OF_WEEK}}）</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">時間</td>
          <td style="padding: 8px 0;">{{START_TIME}} ～ {{END_TIME}}</td>
        </tr>
        {{#if CONTACT_NOTES}}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; vertical-align: top;">連絡事項</td>
          <td style="padding: 8px 0;">{{CONTACT_NOTES}}</td>
        </tr>
        {{/if}}
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{RESERVATION_DETAIL_URL}}" style="display: inline-block; background-color: #0067B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 14px;">
        予約詳細を確認する
      </a>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ キャンセルについて</strong><br>
        予約のキャンセルは、当日0時まで可能です。それ以降のキャンセルはできませんのでご注意ください。
      </p>
    </div>
    
    <div style="background-color: #e3f2fd; border-left: 4px solid #0067B1; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>ℹ️ 天候について</strong><br>
        雨天等により予約が中止となる場合は、別途ご連絡いたします。<br>
        ご不明な点がございましたら、お気軽にお問い合わせください。
      </p>
    </div>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

### 8. 雨天中止の一斉通知メール

**件名：** `【テニスコート予約システム】【重要】雨天のため予約が中止となりました`

**HTML本文：**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #E72241; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">【重要】予約中止のお知らせ</h1>
  </div>
  
  <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <div style="background-color: #ffebee; border: 2px solid #E72241; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <p style="font-size: 20px; font-weight: bold; margin: 0; color: #E72241;">
        ⚠️ 雨天のため予約が中止となりました
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 30px;">
      {{FULL_NAME}}様<br>
      <br>
      誠に申し訳ございませんが、雨天のため、以下の予約を中止とさせていただきます。
    </p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <h2 style="font-size: 16px; margin-top: 0; margin-bottom: 15px; color: #16145F;">中止となった予約内容</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; width: 120px;">予約番号</td>
          <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #E72241;">{{RESERVATION_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約日</td>
          <td style="padding: 8px 0;">{{BOOKING_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">時間</td>
          <td style="padding: 8px 0;">{{START_TIME}} ～ {{END_TIME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">予約者名</td>
          <td style="padding: 8px 0;">{{FULL_NAME}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">中止理由</td>
          <td style="padding: 8px 0; color: #E72241;">雨天</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #e3f2fd; border-left: 4px solid #0067B1; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>ℹ️ 再予約について</strong><br>
        ご希望の場合は、別の日程で再度ご予約いただけます。<br>
        再予約は<a href="{{BOOKING_URL}}" style="color: #0067B1;">予約カレンダー</a>から可能です。
      </p>
    </div>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚠️ 自動キャンセル処理</strong><br>
        本予約は自動的にキャンセル処理が完了しております。<br>
        キャンセル料は発生いたしません。
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      ご不便をおかけして申し訳ございません。<br>
      ご不明な点がございましたら、お気軽にお問い合わせください。
    </p>
  </div>
  
  <!-- 共通フッター -->
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
  <p style="font-size: 12px; color: #666; line-height: 1.6;">
    <strong>運営会社</strong><br>
    iPark Institute Co., Ltd.<br>
    <br>
    <a href="https://tennis-court-reservation.example.com/privacy" style="color: #0067B1;">プライバシーポリシー</a>
  </p>
  <p style="font-size: 11px; color: #999; margin-top: 20px;">
    ※このメールは送信専用です。返信はできません。
  </p>
</body>
</html>
```

---

---

## 📌 テンプレート変数一覧

以下の変数を実際の値に置き換えて使用してください：

| 変数名 | 説明 | 使用メール |
|--------|------|-----------|
| `{{CONFIRMATION_LINK}}` | メール認証リンク | 1. 新規登録時のメール認証 |
| `{{RESET_LINK}}` | パスワードリセットリンク | 2. パスワードリセットメール |
| `{{FULL_NAME}}` | 会員の氏名 | 3, 5, 6, 7 |
| `{{GUEST_NAME}}` | ゲストの氏名 | 4 |
| `{{RESERVATION_NUMBER}}` | 予約番号 | 3, 4, 5, 6, 7, 8 |
| `{{BOOKING_DATE}}` | 予約日（YYYY年MM月DD日） | 3, 4, 5, 6, 7, 8 |
| `{{DAY_OF_WEEK}}` | 曜日（月、火、水等） | 7 |
| `{{START_TIME}}` | 開始時間（HH:MM） | 3, 4, 5, 6, 7, 8 |
| `{{END_TIME}}` | 終了時間（HH:MM） | 3, 4, 5, 6, 7, 8 |
| `{{PHONE}}` | （廃止）電話番号は収集しない | - |
| `{{GUEST_PHONE}}` | （廃止）ゲスト電話番号は収集しない | - |
| `{{CONTACT_NOTES}}` | 連絡事項 | 3, 4, 7 |
| `{{RESERVATION_DETAIL_URL}}` | 予約詳細ページのURL | 3, 5, 7 |
| `{{BOOKING_URL}}` | 予約カレンダーページのURL | 6, 8 |
| `{{OLD_BOOKING_DATE}}` | 変更前の予約日 | 5 |
| `{{OLD_START_TIME}}` | 変更前の開始時間 | 5 |
| `{{OLD_END_TIME}}` | 変更前の終了時間 | 5 |
| `{{NEW_BOOKING_DATE}}` | 変更後の予約日 | 5 |
| `{{NEW_START_TIME}}` | 変更後の開始時間 | 5 |
| `{{NEW_END_TIME}}` | 変更後の終了時間 | 5 |
| `{{CHANGED_AT}}` | 変更日時 | 5 |
| `{{CANCELLED_AT}}` | キャンセル日時 | 6 |
| `{{CANCELLATION_REASON}}` | キャンセル理由 | 6 |

---

## 📧 送信元設定

すべてのメールの送信元は以下のように設定してください：

- **送信元名：** `iPark Institute Co., Ltd.`
- **送信元メールアドレス：** `noreply@ipark-institute.com`（実際のドメインに置き換え）
- **返信先：** `support@ipark-institute.com`（実際のメールアドレスに置き換え）

---

*最終更新: 2025年1月*
