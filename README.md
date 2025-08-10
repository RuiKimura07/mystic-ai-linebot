# 占いの小窓 | LINE公式アカウント有料チャットシステム

LINEログインを使用したポイント課金システムを実装したNext.jsアプリケーションです。

## 機能

### ユーザー機能
- LINEアカウントでのログイン認証
- ポイント購入（Stripe決済）
- マイページ（残高確認、取引履歴）
- 占いチャット利用（ポイント消費）

### 管理者機能
- 管理者ログイン
- ユーザー管理（一覧、検索、詳細表示、アカウント凍結/解除）
- ポイント管理（残高調整、履歴確認）

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **認証**: LINE Login API, JWT
- **決済**: Stripe
- **デプロイ**: Render.com

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
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

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

## プロジェクト構造

```
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