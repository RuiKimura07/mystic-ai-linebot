import { NextRequest, NextResponse } from 'next/server';
import { sendPushMessage } from '@/lib/line';

// Stripe Webhook処理
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    // Stripe署名検証（要実装）
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // デモ用の簡易処理
    const event = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

// 決済成功時の処理
async function handlePaymentSuccess(session: any) {
  try {
    // ユーザーIDとポイント数を取得（メタデータから）
    const userId = session.metadata?.userId;
    const points = parseInt(session.metadata?.points || '0');
    const lineUserId = session.metadata?.lineUserId;

    if (!userId || !points) {
      console.error('Missing user or points data in webhook');
      return;
    }

    // データベースのポイント残高を更新（要実装）
    // await updateUserBalance(userId, points);

    // LINE通知送信
    if (lineUserId) {
      const message = {
        type: 'text',
        text: `🎉 ポイント購入完了！\n\n💳 購入ポイント: ${points.toLocaleString()}pt\n💰 決済金額: ¥${(session.amount_total / 100).toLocaleString()}\n\nすぐに占いチャットをお楽しみいただけます！\n\n👉 チャット開始: ${process.env.NEXT_PUBLIC_APP_URL}/chat`
      };

      await sendPushMessage(lineUserId, [message]);
    }

    console.log(`Payment success: User ${userId} purchased ${points} points`);
  } catch (error) {
    console.error('Payment success handler error:', error);
  }
}

// 決済失敗時の処理
async function handlePaymentFailed(paymentIntent: any) {
  try {
    const userId = paymentIntent.metadata?.userId;
    const lineUserId = paymentIntent.metadata?.lineUserId;

    if (lineUserId) {
      const message = {
        type: 'text',
        text: `❌ ポイント購入に失敗しました\n\n決済処理中にエラーが発生いたしました。\nお手数ですが、再度お試しいただくか\nサポートまでお問い合わせください。\n\n👉 再購入: ${process.env.NEXT_PUBLIC_APP_URL}/points/purchase`
      };

      await sendPushMessage(lineUserId, [message]);
    }

    console.log(`Payment failed for user: ${userId}`);
  } catch (error) {
    console.error('Payment failed handler error:', error);
  }
}