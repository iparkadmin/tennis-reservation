# レート制限実装ガイド

## 📋 目的

スパム攻撃やDoS攻撃から予約システムを保護するため、API呼び出しに制限を設けます。

---

## 🎯 保護対象

| エンドポイント | 制限 | 理由 |
|--------------|------|------|
| `/api/auth/login` | 5回/分 | ブルートフォース攻撃防止 |
| `/api/auth/signup` | 3回/時間 | スパム登録防止 |
| `/api/reservations/create` | 10回/分 | スパム予約防止 |
| `/api/reservations/cancel` | 5回/分 | 悪用防止 |
| 全エンドポイント | 100回/分 | DoS攻撃防止 |

---

## 🔧 実装方法

### **オプション1: Vercel Edge Middleware + Upstash Redis（推奨）** ⭐

**メリット**:
- ✅ エッジで処理（低レイテンシー）
- ✅ グローバル分散
- ✅ 無料枠あり（Upstash）

**実装手順**:

#### 1. 依存関係をインストール

```bash
cd tennis-app
npm install @upstash/redis @upstash/ratelimit
```

#### 2. Upstash Redisのセットアップ

1. https://upstash.com/ にアクセス
2. 無料アカウント作成
3. Redis Database を作成
4. `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` をコピー

#### 3. 環境変数を設定

**Vercel Environment Variables**:
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

**`.env.local`**:
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

#### 4. Middleware を作成

**`src/middleware.ts`**:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Redisクライアントを初期化
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// レート制限の設定
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 1分間に100リクエスト
  analytics: true, // 統計情報を記録
});

// 認証系APIの厳しい制限
const authRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 1分間に5リクエスト
});

// 予約系APIの制限
const reservationRatelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 1分間に10リクエスト
});

export async function middleware(request: NextRequest) {
  // IPアドレスを取得
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // パスに応じて制限を適用
  const path = request.nextUrl.pathname;

  let result;

  if (path.startsWith('/api/auth/')) {
    // 認証系API: 厳しい制限
    result = await authRatelimit.limit(ip);
  } else if (path.startsWith('/api/reservations/')) {
    // 予約系API: 中程度の制限
    result = await reservationRatelimit.limit(ip);
  } else if (path.startsWith('/api/')) {
    // その他のAPI: 通常の制限
    result = await ratelimit.limit(ip);
  } else {
    // API以外はスキップ
    return NextResponse.next();
  }

  // レート制限を超えた場合
  if (!result.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'レート制限を超えました。しばらくしてから再度お試しください。',
        retryAfter: result.reset,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // レート制限内: 通過
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  return response;
}

// Middlewareを適用するパス
export const config = {
  matcher: '/api/:path*',
};
```

---

### **オプション2: Supabase Rate Limit Extension**

**メリット**:
- ✅ Supabaseネイティブ
- ✅ 追加サービス不要

**実装手順**:

#### 1. Supabase Extensionを有効化

```sql
-- Supabase SQL Editorで実行
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- レート制限テーブルを作成
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,  -- IPアドレスまたはuser_id
  count INTEGER DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 minute'
);

-- レート制限チェック関数
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_limit INTEGER DEFAULT 100,
  p_window INTERVAL DEFAULT INTERVAL '1 minute'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_reset_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 現在のカウントを取得
  SELECT count, reset_at INTO v_count, v_reset_at
  FROM rate_limits
  WHERE identifier = p_identifier;

  -- レコードが存在しない、または期限切れの場合
  IF v_count IS NULL OR v_reset_at < NOW() THEN
    INSERT INTO rate_limits (identifier, count, reset_at)
    VALUES (p_identifier, 1, NOW() + p_window)
    ON CONFLICT (identifier) DO UPDATE
    SET count = 1, reset_at = NOW() + p_window;
    RETURN TRUE;
  END IF;

  -- 制限を超えている場合
  IF v_count >= p_limit THEN
    RETURN FALSE;
  END IF;

  -- カウントを増やす
  UPDATE rate_limits
  SET count = count + 1
  WHERE identifier = p_identifier;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

#### 2. API Routeで使用

**`src/app/api/reservations/create/route.ts`**:
```typescript
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // IPアドレスを取得
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // レート制限チェック
  const { data: allowed } = await supabase.rpc('check_rate_limit', {
    p_identifier: ip,
    p_limit: 10,
    p_window: '1 minute',
  });

  if (!allowed) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 予約処理を続行
  // ...
}
```

---

### **オプション3: Cloudflare Rate Limiting**

**メリット**:
- ✅ DNSレベルで保護
- ✅ 高性能
- ⚠️ 有料プラン必要（Rate Limiting Rules）

**実装手順**:

1. Cloudflareダッシュボードにアクセス
2. **Security** → **Rate Limiting** を選択
3. ルールを作成:
   - URL Pattern: `tennis-reservation.vercel.app/api/*`
   - Rate: 100 requests per minute
   - Action: Block

---

## 📊 推奨構成

| 環境 | 推奨方法 | 理由 |
|------|---------|------|
| **開発環境** | なし（オプション） | 開発の妨げにならない |
| **ステージング** | Vercel Middleware | テスト用 |
| **本番環境** | Vercel Middleware + Upstash | **推奨** ⭐ |
| **大規模** | Cloudflare | エンタープライズ向け |

---

## 🧪 テスト方法

### 1. ローカルテスト

```bash
# 連続リクエストでテスト
for i in {1..110}; do
  curl -X POST http://localhost:3000/api/reservations/create \
    -H "Content-Type: application/json" \
    -d '{"test": true}'
  echo "Request $i"
done
```

### 2. レスポンスヘッダーを確認

```bash
curl -I http://localhost:3000/api/reservations/create
```

**期待されるヘッダー**:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1642345678000
```

### 3. 制限を超えた場合

**レスポンス**:
```json
{
  "error": "Too many requests",
  "message": "レート制限を超えました。しばらくしてから再度お試しください。",
  "retryAfter": 1642345678000
}
```

**ステータスコード**: `429 Too Many Requests`

---

## 🎯 まとめ

| 対策 | 実装難易度 | コスト | 効果 |
|------|-----------|--------|------|
| **Vercel Middleware** | 🟡 中 | 無料 | 🟢 高 |
| **Supabase Extension** | 🟡 中 | 無料 | 🟡 中 |
| **Cloudflare** | 🟢 低 | 有料 | 🟢 高 |

---

**推奨**: Vercel Middleware + Upstash Redis（無料枠で十分）

---

*最終更新: 2026年1月*
