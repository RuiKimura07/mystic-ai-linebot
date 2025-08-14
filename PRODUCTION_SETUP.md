# 🚀 占いの小窓 - 本番運用開始手順書

## 📋 **設定チェックリスト**

### ✅ **1. LINE Developers 設定**

#### **1.1 LINE Developersコンソール にアクセス**
- URL: https://developers.line.biz/console/
- LINEアカウントでログイン

#### **1.2 新しいプロバイダーを作成**
```
プロバイダー名: 占いの小窓（任意）
```

#### **1.3 LINE Loginチャンネルを作成**
```
チャンネル名: 占いの小窓ログイン
アプリタイプ: WEBアプリ
説明: 占いチャットサービスのユーザー認証
```

**重要な設定項目:**
- **Channel ID**: `NEXT_PUBLIC_LINE_CHANNEL_ID` で使用
- **Channel Secret**: `LINE_CHANNEL_SECRET` で使用  
- **コールバックURL**: `https://your-domain.com/auth/callback`

#### **1.4 Messaging APIチャンネルを作成**
```
チャンネル名: 占いの小窓メッセージ
説明: 占いチャットサービスの通知・メッセージ送信
```

**重要な設定項目:**
- **Channel Access Token**: `LINE_CHANNEL_ACCESS_TOKEN` で使用
- **Webhook URL**: `https://your-domain.com/api/webhook/line`
- **Webhook利用**: ON
- **応答メッセージ**: OFF
- **あいさつメッセージ**: ON

#### **1.5 リッチメニューの設定（オプション）**
```json
{
  "size": {
    "width": 2500,
    "height": 843
  },
  "selected": true,
  "name": "占いの小窓メニュー",
  "chatBarText": "メニューを開く",
  "areas": [
    {
      "bounds": {"x": 0, "y": 0, "width": 833, "height": 843},
      "action": {"type": "uri", "uri": "https://your-domain.com/chat"}
    },
    {
      "bounds": {"x": 833, "y": 0, "width": 834, "height": 843},
      "action": {"type": "uri", "uri": "https://your-domain.com/points/purchase"}
    },
    {
      "bounds": {"x": 1667, "y": 0, "width": 833, "height": 843},
      "action": {"type": "uri", "uri": "https://your-domain.com/dashboard"}
    }
  ]
}
```

---

### ✅ **2. Stripe 設定**

#### **2.1 Stripeアカウント作成**
- URL: https://dashboard.stripe.com/register
- 事業者情報を登録

#### **2.2 APIキーの取得**
- **公開可能キー**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **シークレットキー**: `STRIPE_SECRET_KEY`

#### **2.3 Webhook エンドポイントの設定**
```
エンドポイントURL: https://your-domain.com/api/stripe/webhook
イベント選択:
  - checkout.session.completed
  - payment_intent.payment_failed
```

**Webhook署名シークレット**: `STRIPE_WEBHOOK_SECRET` で使用

#### **2.4 商品の作成**
各ポイントプランの商品を作成:
```
500pt:   ¥500
1,000pt: ¥980  
3,000pt: ¥2,850
5,000pt: ¥4,500
10,000pt: ¥8,500
```

---

### ✅ **3. render.com デプロイ設定**

#### **3.1 render.com アカウント作成**
- URL: https://render.com
- GitHubアカウントと連携

#### **3.2 WebServiceの作成**
```
Repository: あなたのGitHubリポジトリ
Branch: main
Root Directory: mysticai-public
```

#### **3.3 環境変数の設定**
render.com の Environment 画面で以下を設定:

```bash
# アプリケーション設定
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
NODE_ENV=production

# JWT認証（render.comが自動生成）
JWT_SECRET=(自動生成済み)

# LINE設定
NEXT_PUBLIC_LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abcdef1234567890abcdef
LINE_CHANNEL_ACCESS_TOKEN=your-line-channel-access-token
NEXT_PUBLIC_LINE_REDIRECT_URI=https://your-app-name.onrender.com/auth/callback

# Stripe設定
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```

---

### ✅ **4. ドメイン設定（オプション）**

#### **4.1 独自ドメインの設定**
render.com で Custom Domain を設定:
```
your-uranai-service.com
```

#### **4.2 環境変数の更新**
ドメイン設定後、以下を更新:
```bash
NEXT_PUBLIC_APP_URL=https://your-uranai-service.com
NEXT_PUBLIC_LINE_REDIRECT_URI=https://your-uranai-service.com/auth/callback
```

#### **4.3 LINE設定の更新**
LINE DevelopersコンソールでコールバックURLを更新:
```
https://your-uranai-service.com/auth/callback
```

---

### ✅ **5. 動作確認手順**

#### **5.1 基本動作確認**
1. **ヘルスチェック**: `https://your-domain.com/api/health`
2. **トップページアクセス**: `https://your-domain.com/`
3. **管理画面アクセス**: `https://your-domain.com/admin/login`

#### **5.2 LINE連携確認**
1. LINEログインボタンクリック
2. LINE認証画面でログイン
3. コールバック処理完了
4. ダッシュボード表示確認

#### **5.3 決済機能確認**
1. ポイント購入画面アクセス
2. テスト用クレジットカードで決済
   ```
   カード番号: 4242424242424242
   有効期限: 12/28
   CVC: 123
   ```
3. Webhook受信確認
4. LINE通知確認

#### **5.4 チャット機能確認**
1. 占い師選択
2. チャット開始
3. ポイント消費確認
4. チャット終了通知確認

---

## 🔧 **トラブルシューティング**

### **LINE認証エラー**
```bash
# ログ確認
curl https://your-domain.com/api/health

# 環境変数確認
- NEXT_PUBLIC_LINE_CHANNEL_ID が正しいか
- LINE_CHANNEL_SECRET が正しいか
- コールバックURLが一致しているか
```

### **決済エラー**
```bash
# Stripe設定確認
- 公開可能キーとシークレットキーが正しいか
- Webhook URLが正しく設定されているか
- 商品IDが存在するか
```

### **Webhook エラー**
```bash
# 署名検証エラーの場合
- STRIPE_WEBHOOK_SECRET が正しいか
- エンドポイントURLが正しいか
```

---

## 📊 **監視とメンテナンス**

### **1. ログ監視**
render.com のログ画面で以下を監視:
```
- 認証エラー
- 決済エラー  
- Webhook エラー
- API レスポンスタイム
```

### **2. パフォーマンス監視**
- ヘルスチェック API の定期監視
- レスポンスタイムの監視
- エラー率の監視

### **3. セキュリティ対策**
- SSL証明書の自動更新確認
- 定期的な依存関係の更新
- ログの定期的な確認

---

## 🎉 **運用開始おめでとうございます！**

すべての設定が完了すると、フル機能のLINE占いチャットサービスが稼働します。

**サポートが必要な場合は、いつでもお声がけください！**