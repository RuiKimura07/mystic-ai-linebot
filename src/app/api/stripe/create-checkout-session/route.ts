import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// 料金プランの定義
const pricePlans = {
  'plan-500': { points: 500, price: 500, bonus: null },
  'plan-1000': { points: 1000, price: 980, bonus: '2%お得' },
  'plan-3000': { points: 3000, price: 2850, bonus: '5%お得' },
  'plan-5000': { points: 5000, price: 4500, bonus: '10%お得' },
  'plan-10000': { points: 10000, price: 8500, bonus: '15%お得' },
};

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();
    
    // プランの検証
    const plan = pricePlans[planId as keyof typeof pricePlans];
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得（本来はセッションから取得）
    // デモ用に固定値を使用
    const userId = 'demo-user-001';
    const userEmail = 'demo@example.com';
    const lineUserId = 'demo-line-user';

    // Stripe Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `ポイント購入 - ${plan.points}pt`,
              description: plan.bonus ? `${plan.bonus}` : '占いチャット用ポイント',
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/points/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/points/purchase`,
      metadata: {
        userId: userId,
        points: plan.points.toString(),
        lineUserId: lineUserId,
        planId: planId,
      },
      customer_email: userEmail,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}