<<<<<<< HEAD
# 占いの小窓 | LINE公式アカウント有料チャットシステム (公開版)

LINEログインを使用したポイント課金システムを実装したNext.jsアプリケーション

> ⚠️ **注意**: これは公開用のリポジトリです。実際の運用には追加の設定と環境変数の設定が必要です。
=======
# 占いの小窓 | LINE公式アカウント有料チャットシステム

LINEログインを使用したポイント課金システムを実装したNext.jsアプリケーションです。
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d

## 機能

### ユーザー機能
- LINEアカウントでのログイン認証
<<<<<<< HEAD
- ポイント購入システム（Stripe決済対応）
- マイページ（残高確認、取引履歴）
- レスポンシブデザイン

### 管理者機能
- 管理者認証システム
- ユーザー管理（一覧、検索、詳細表示、アカウント制御）
=======
- ポイント購入（Stripe決済）
- マイページ（残高確認、取引履歴）
- 占いチャット利用（ポイント消費）

### 管理者機能
- 管理者ログイン
- ユーザー管理（一覧、検索、詳細表示、アカウント凍結/解除）
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
- ポイント管理（残高調整、履歴確認）

## 技術スタック

<<<<<<< HEAD
- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
=======
- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
- **認証**: LINE Login API, JWT
- **決済**: Stripe
- **デプロイ**: Render.com

<<<<<<< HEAD
## 開発環境のセットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/mysticai-line-chat.git
cd mysticai-line-chat
=======
## セットアップ

### 1. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定：

```env
# LINE Login
NEXT_PUBLIC_LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
NEXT_PUBLIC_LINE_REDIRECT_URI=https://your-app.onrender.com/api/auth/callback/line

# JWT
JWT_SECRET=your_jwt_secret_key_minimum_32_chars

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
```

### 2. 依存関係のインストール

```bash
npm install
```

<<<<<<< HEAD
### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# LINE Login API
NEXT_PUBLIC_LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
NEXT_PUBLIC_LINE_REDIRECT_URI=http://localhost:3000/api/auth/callback/line

# JWT Secret (32文字以上)
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long

# Stripe API
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 開発サーバーの起動
=======
### 3. 開発サーバーの起動
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d

```bash
npm run dev
```

<<<<<<< HEAD
アプリケーションは http://localhost:3000 でアクセスできます。

## プロダクション環境へのデプロイ

### Render.comへのデプロイ

1. [Render.com](https://render.com)にアカウント作成
2. このリポジトリを接続
3. Web Serviceとして新規作成
4. 環境変数を設定（本番環境用のAPIキーを使用）
5. デプロイ実行

詳細な手順は `docs/deployment.md` を参照してください。

## 主要な画面

### ユーザー画面
- `/login` - LINEログイン
- `/dashboard` - ユーザーダッシュボード
- `/points/purchase` - ポイント購入

### 管理画面
- `/admin/login` - 管理者ログイン
- `/admin/users` - ユーザー管理
- `/admin/points` - ポイント管理

## API エンドポイント

### 認証
- `POST /api/auth/callback/line` - LINEログインコールバック

### ポイント（実装予定）
- `POST /api/points/purchase` - ポイント購入
- `GET /api/points/balance` - 残高取得
- `GET /api/points/history` - 取引履歴
=======
http://localhost:3000 でアプリケーションにアクセスできます。

## Render.comへのデプロイ

### 1. GitHubリポジトリの準備

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. Render.comでの設定

1. [Render.com](https://render.com)にサインアップ/ログイン
2. 「New +」→「Web Service」を選択
3. GitHubリポジトリを接続
4. 以下の設定を入力：
   - **Name**: mysticai-line-chat
   - **Region**: Singapore (または最寄りのリージョン)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### 3. 環境変数の設定

Renderのダッシュボードで「Environment」タブから環境変数を追加：

- `NODE_ENV`: production
- `NEXT_PUBLIC_LINE_CHANNEL_ID`: [LINE Developersから取得]
- `LINE_CHANNEL_SECRET`: [LINE Developersから取得]
- `NEXT_PUBLIC_LINE_REDIRECT_URI`: https://[your-app-name].onrender.com/api/auth/callback/line
- `JWT_SECRET`: [32文字以上のランダム文字列]
- `STRIPE_SECRET_KEY`: [Stripeダッシュボードから取得]
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: [Stripeダッシュボードから取得]
- `NEXT_PUBLIC_APP_URL`: https://[your-app-name].onrender.com

### 4. LINE Developers設定

1. [LINE Developers Console](https://developers.line.biz/console/)にアクセス
2. 新規チャネル作成（LINE Login）
3. Callback URLに`https://[your-app-name].onrender.com/api/auth/callback/line`を追加
4. Channel IDとChannel Secretを環境変数に設定

### 5. Stripe設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)にアクセス
2. APIキーを取得（テスト環境/本番環境）
3. 環境変数に設定
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d

## プロジェクト構造

```
<<<<<<< HEAD
src/
├── app/
│   ├── login/              # LINEログイン画面
│   ├── dashboard/          # ユーザーダッシュボード
│   ├── points/
│   │   └── purchase/       # ポイント購入画面
│   ├── admin/              # 管理画面
│   │   ├── login/          # 管理者ログイン
│   │   ├── users/          # ユーザー管理
│   │   └── points/         # ポイント管理
│   └── api/                # APIエンドポイント
│       └── auth/
│           └── callback/
│               └── line/   # LINE認証コールバック
├── components/             # 共通コンポーネント（予定）
└── lib/                   # ユーティリティ関数（予定）
```

## 開発に必要な外部サービス

### LINE Developers
1. [LINE Developers Console](https://developers.line.biz/console/)でプロバイダー作成
2. LINE Loginチャネル作成
3. Callback URLを設定
4. Channel IDとChannel Secretを取得

### Stripe
1. [Stripe Dashboard](https://dashboard.stripe.com/)でアカウント作成
2. APIキーを取得（テスト/本番環境）
3. Webhookエンドポイントを設定（予定）

## セキュリティ

- JWT トークンによる認証
- 環境変数による機密情報の管理
- HTTPS必須（本番環境）
- CSRF対策実装済み

## ライセンス

MIT License

## 貢献

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## サポート

質問や問題がある場合は、GitHubのIssuesでお知らせください。
=======
mysticai-line-chat/
├── src/
│   └── app/
│       ├── login/              # LINEログイン画面
│       ├── dashboard/          # ユーザーダッシュボード
│       ├── points/
│       │   └── purchase/       # ポイント購入画面
│       ├── admin/
│       │   ├── login/          # 管理者ログイン
│       │   ├── users/          # ユーザー管理
│       │   └── points/         # ポイント管理
│       └── api/
│           └── auth/
│               └── callback/
│                   └── line/   # LINE認証コールバック
├── public/                     # 静的ファイル
├── render.yaml                 # Render.com設定
└── package.json
```

## ライセンス

Private
>>>>>>> 1dcfe17880d6c3c99c4bdce410965f224500cc3d
