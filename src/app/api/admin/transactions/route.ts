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
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    
    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    // Get transactions with user data
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: limit,
        include: {
          user: {
            select: {
              displayName: true,
              email: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);
    
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      userName: transaction.user.displayName,
      userEmail: transaction.user.email,
      createdAt: transaction.createdAt,
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      stripePaymentId: transaction.stripePaymentId,
      stripeSessionId: transaction.stripeSessionId,
    }));
    
    return NextResponse.json({
      transactions: formattedTransactions,
      total,
      limit,
      offset,
    });
    
  } catch (error: any) {
    logger.error('Failed to get admin transactions', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}