# 本番環境デプロイメントガイド

## 目次
1. [デプロイ前チェックリスト](#デプロイ前チェックリスト)
2. [環境変数の設定](#環境変数の設定)
3. [セキュリティ設定](#セキュリティ設定)
4. [LINE API設定](#line-api設定)
5. [Stripe設定](#stripe設定)
6. [モニタリング設定](#モニタリング設定)
7. [トラブルシューティング](#トラブルシューティング)

## デプロイ前チェックリスト

### 必須項目
- [ ] 環境変数をすべて設定した
- [ ] JWT_SECRET を安全なランダム文字列に変更した
- [ ] SESSION_SECRET を安全なランダム文字列に変更した
- [ ] ADMIN_PASSWORD を強力なパスワードに変更した
- [ ] DEMO_MODE を false に設定した
- [ ] NEXT_PUBLIC_APP_URL を実際のドメインに設定した

### 推奨項目
- [ ] HTTPSが有効になっている
- [ ] バックアップ戦略を策定した
- [ ] モニタリングツールを設定した
- [ ] エラー追跡サービスを設定した
- [ ] ログ収集システムを設定した

## 環境変数の設定

### 1. Render.comでの設定

```bash
# Render.comダッシュボード → Environment → Add Environment Variable

# 必須環境変数
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
JWT_SECRET=[32文字以上のランダム文字列]
SESSION_SECRET=[32文字以上のランダム文字列]
ADMIN_PASSWORD=[強力なパスワード]
```

### 2. 環境変数の生成

```bash
# セキュアなランダム文字列の生成（Linux/Mac）
openssl rand -base64 32

# Node.jsでの生成
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## セキュリティ設定

### 1. セキュリティヘッダー
アプリケーションは自動的に以下のセキュリティヘッダーを設定します：
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security（HTTPS環境のみ）
- Content-Security-Policy

### 2. レート制限
デフォルト設定：
- 1分間に60リクエストまで
- IPアドレスベースの制限

カスタマイズ：
```env
RATE_LIMIT_WINDOW_MS=60000  # ウィンドウサイズ（ミリ秒）
RATE_LIMIT_MAX_REQUESTS=60  # 最大リクエスト数
```

### 3. CORS設定
必要に応じて`next.config.ts`でCORSを設定：
```typescript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "https://your-domain.com" },
      ],
    },
  ]
}
```

## LINE API設定

### 1. LINE Developersコンソール設定

1. [LINE Developers](https://developers.line.biz/console/)にアクセス
2. 新規プロバイダーを作成
3. LINE Loginチャネルを作成
   - アプリタイプ: ウェブアプリ
   - Callback URL: `https://your-app.onrender.com/api/auth/callback/line`
4. Messaging APIチャネルを作成（オプション）

### 2. 必要な情報の取得

LINE Loginチャネル：
- Channel ID → `NEXT_PUBLIC_LINE_CHANNEL_ID`
- Channel Secret → `LINE_CHANNEL_SECRET`

Messaging APIチャネル（オプション）：
- Channel Access Token → `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`
- Channel Secret → `LINE_MESSAGING_CHANNEL_SECRET`

## Stripe設定

### 1. Stripeダッシュボード設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)にアクセス
2. APIキーを取得
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### 2. Webhook設定

1. Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-app.onrender.com/api/stripe/webhook`
3. イベントを選択：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Signing secret → `STRIPE_WEBHOOK_SECRET`

## モニタリング設定

### 1. ヘルスチェック
```bash
curl https://your-app.onrender.com/api/health
```

レスポンス例：
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production",
  "services": {
    "app": "operational",
    "line": {
      "configured": true,
      "status": "operational"
    },
    "stripe": {
      "configured": true,
      "status": "operational"
    }
  }
}
```

### 2. ログ設定
```env
LOG_LEVEL=INFO  # ERROR, WARN, INFO, DEBUG
```

### 3. エラー追跡（推奨）

Sentryの設定例：
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. 環境変数が読み込まれない
- Render.comで環境変数が正しく設定されているか確認
- ビルドログでエラーメッセージを確認
- `/api/health`エンドポイントで設定状態を確認

#### 2. LINE認証が失敗する
- Callback URLが正しく設定されているか確認
- Channel IDとChannel Secretが正しいか確認
- HTTPSが有効になっているか確認

#### 3. Stripe決済が機能しない
- APIキーが本番用か確認（`pk_live_`、`sk_live_`で始まる）
- Webhookが正しく設定されているか確認
- Webhook Secretが正しいか確認

#### 4. レート制限エラー
- 環境変数でレート制限を調整
- CloudflareなどのCDNを使用してキャッシュを設定

### デバッグモード

開発環境でのデバッグ：
```env
LOG_LEVEL=DEBUG
NODE_ENV=development
```

### サポート

問題が解決しない場合：
1. GitHubのIssuesで報告
2. ログを確認（Render.comのLogs）
3. `/api/health`エンドポイントの出力を確認

## 本番運用のベストプラクティス

1. **定期的なバックアップ**
   - データベースの定期バックアップ
   - 設定ファイルのバックアップ

2. **モニタリング**
   - アップタイム監視（UptimeRobot等）
   - エラー率の監視
   - パフォーマンス監視

3. **セキュリティアップデート**
   - 依存関係の定期更新
   - セキュリティパッチの適用

4. **スケーリング**
   - トラフィック増加に備えた計画
   - CDNの活用
   - データベースの最適化

5. **災害復旧計画**
   - バックアップからの復旧手順
   - 代替環境の準備

## 更新履歴

- 2025-08-14: 初版作成
- セキュリティ強化、レート制限追加
- 環境変数検証機能追加