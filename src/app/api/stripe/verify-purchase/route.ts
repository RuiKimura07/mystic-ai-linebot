import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET(request: NextRequest) {
  try {
    // ユーザー認証
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // セッションIDを取得
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Stripeセッションを取得
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // セッションの所有者確認
    if (session.metadata?.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 403 });
    }

    // 決済が完了しているか確認
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // 購入詳細を返す
    const purchaseDetails = {
      sessionId: session.id,
      points: parseInt(session.metadata?.points || '0'),
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency,
      status: session.payment_status,
      date: new Date(session.created * 1000).toLocaleString('ja-JP'),
      planId: session.metadata?.planId,
    };

    logger.info('Purchase verified', {
      userId: decoded.userId,
      sessionId,
      points: purchaseDetails.points,
      amount: purchaseDetails.amount
    });

    return NextResponse.json(purchaseDetails);
    
  } catch (error: any) {
    logger.error('Purchase verification error', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    );
  }
}