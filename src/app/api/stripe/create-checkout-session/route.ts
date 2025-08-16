import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// 料金プランの定義
const pricePlans = {
  'plan_500': { points: 500, price: 500, bonus: null },
  'plan_1000': { points: 1000, price: 980, bonus: '2%お得' },
  'plan_3000': { points: 3000, price: 2850, bonus: '5%お得' },
  'plan_5000': { points: 5000, price: 4500, bonus: '10%お得' },
  'plan_10000': { points: 10000, price: 8500, bonus: '15%お得' },
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

    // ユーザー認証
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
      success_url: `${env.APP_URL}/points/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/points/purchase`,
      metadata: {
        userId: user.id,
        points: plan.points.toString(),
        lineUserId: user.lineUserId,
        planId: planId,
      },
      customer_email: user.email || undefined,
    });

    logger.info('Stripe checkout session created', {
      userId: user.id,
      sessionId: session.id,
      planId,
      points: plan.points,
      price: plan.price
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    logger.error('Stripe session creation error', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}