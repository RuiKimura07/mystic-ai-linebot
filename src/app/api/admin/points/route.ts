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
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'balance';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { lineUserId: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    
    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'displayName') {
      orderBy.displayName = sortOrder;
    } else if (sortBy === 'balance') {
      orderBy.balance = sortOrder;
    } else if (sortBy === 'totalPurchased') {
      orderBy.totalPurchased = sortOrder;
    } else if (sortBy === 'totalUsed') {
      orderBy.totalUsed = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }
    
    // Get users with points data
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          displayName: true,
          email: true,
          balance: true,
          totalPurchased: true,
          totalUsed: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              transactions: true
            }
          },
          transactions: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              createdAt: true,
              type: true,
              amount: true,
              description: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      balance: user.balance,
      totalPurchased: user.totalPurchased,
      totalUsed: user.totalUsed,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      transactionCount: user._count.transactions,
      lastTransaction: user.transactions[0] || null
    }));
    
    return NextResponse.json({
      users: formattedUsers,
      total,
      limit,
      offset,
    });
    
  } catch (error: any) {
    logger.error('Failed to get admin points data', error);
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
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { userId, amount, reason } = body;
    
    if (!userId || !amount || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Calculate new balance
    const newBalance = user.balance + amount;
    
    if (newBalance < 0) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }
    
    // Create transaction and update user balance
    const [transaction, updatedUser] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId: userId,
          type: 'ADJUSTMENT',
          amount: amount,
          description: `管理者調整: ${reason}`,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          balance: newBalance,
        },
      }),
    ]);
    
    logger.info('Admin point adjustment', { 
      adminId: decoded.userId,
      userId: userId,
      amount: amount,
      reason: reason,
      newBalance: newBalance
    });
    
    return NextResponse.json({
      success: true,
      transaction,
      newBalance: updatedUser.balance,
    });
    
  } catch (error: any) {
    logger.error('Failed to adjust points', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}