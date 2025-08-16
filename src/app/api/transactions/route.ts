import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    
    // Build where clause
    const where: any = {
      userId: decoded.userId,
    };
    
    if (type) {
      where.type = type;
    }
    
    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);
    
    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
    });
    
  } catch (error: any) {
    logger.error('Failed to get transactions', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const body = await request.json();
    
    // Validate admin role for adjustments
    if (body.type === 'ADJUSTMENT' && decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate new balance
    const newBalance = user.balance + body.amount;
    
    if (newBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    
    // Create transaction and update user balance
    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: decoded.userId,
          type: body.type,
          amount: body.amount,
          description: body.description,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
          stripePaymentId: body.stripePaymentId,
          stripeSessionId: body.stripeSessionId,
        },
      }),
      prisma.user.update({
        where: { id: decoded.userId },
        data: {
          balance: newBalance,
          totalPurchased: body.type === 'PURCHASE' 
            ? user.totalPurchased + body.amount 
            : user.totalPurchased,
          totalUsed: body.type === 'USAGE' 
            ? user.totalUsed + Math.abs(body.amount)
            : user.totalUsed,
        },
      }),
    ]);
    
    logger.info('Transaction created', { 
      transactionId: transaction.id, 
      userId: decoded.userId,
      type: body.type,
      amount: body.amount,
    });
    
    return NextResponse.json({
      transaction,
      newBalance: updatedUser.balance,
    });
    
  } catch (error: any) {
    logger.error('Failed to create transaction', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}