import { NextRequest, NextResponse } from 'next/server';
import { sendPushMessage } from '@/lib/line';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

// Stripe Webhook処理
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    const body = await request.text();

    let event;

    // Stripe署名検証
    if (env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        logger.error('Webhook signature verification failed', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // 開発環境では署名検証をスキップ
      event = JSON.parse(body);
    }

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
  } catch (error: any) {
    logger.error('Stripe webhook error', error);
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
    const planId = session.metadata?.planId;

    if (!userId || !points) {
      logger.error('Missing user or points data in webhook', { session });
      return;
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      logger.error('User not found for payment', { userId });
      return;
    }

    // データベースのポイント残高を更新
    const newBalance = user.balance + points;
    const newTotalPurchased = user.totalPurchased + points;

    // トランザクションで更新
    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: userId,
          type: 'PURCHASE',
          amount: points,
          description: `Stripeポイント購入 - ${planId}`,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          stripePaymentId: session.payment_intent,
          stripeSessionId: session.id,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: newBalance,
          totalPurchased: newTotalPurchased,
        },
      }),
    ]);

    logger.info('Payment success: Points added to user', {
      userId,
      points,
      newBalance,
      transactionId: transaction.id,
      stripeSessionId: session.id
    });

    // LINE通知送信
    if (lineUserId) {
      const message = {
        type: 'text',
        text: `🎉 ポイント購入完了！\n\n💳 購入ポイント: ${points.toLocaleString()}pt\n💰 決済金額: ¥${(session.amount_total / 100).toLocaleString()}\n💎 現在の残高: ${newBalance.toLocaleString()}pt\n\nすぐに占いチャットをお楽しみいただけます！\n\n👉 チャット開始: ${env.APP_URL}/chat`
      };

      try {
        await sendPushMessage(lineUserId, [message]);
      } catch (lineError) {
        logger.error('Failed to send LINE notification', { lineError, userId });
      }
    }

  } catch (error) {
    logger.error('Payment success handler error', error);
  }
}

// 決済失敗時の処理
async function handlePaymentFailed(paymentIntent: any) {
  try {
    const userId = paymentIntent.metadata?.userId;
    const lineUserId = paymentIntent.metadata?.lineUserId;

    logger.warn('Payment failed', { userId, paymentIntentId: paymentIntent.id });

    if (lineUserId) {
      const message = {
        type: 'text',
        text: `❌ ポイント購入に失敗しました\n\n決済処理中にエラーが発生いたしました。\nお手数ですが、再度お試しいただくか\nサポートまでお問い合わせください。\n\n👉 再購入: ${env.APP_URL}/points/purchase`
      };

      try {
        await sendPushMessage(lineUserId, [message]);
      } catch (lineError) {
        logger.error('Failed to send LINE notification for payment failure', { lineError, userId });
      }
    }

  } catch (error) {
    logger.error('Payment failed handler error', error);
  }
}