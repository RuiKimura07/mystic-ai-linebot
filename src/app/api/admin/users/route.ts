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
    const sortBy = searchParams.get('sortBy') || 'createdAt';
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
    } else if (sortBy === 'lastLoginAt') {
      orderBy.lastLoginAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }
    
    // Get users with transaction counts
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          _count: {
            select: {
              transactions: true
            }
          },
          transactions: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    
    // Format the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      lineUserId: user.lineUserId,
      balance: user.balance,
      totalPurchased: user.totalPurchased,
      totalUsed: user.totalUsed,
      status: user.status,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      pictureUrl: user.pictureUrl,
      transactionCount: user._count.transactions,
      recentTransactions: user.transactions
    }));
    
    return NextResponse.json({
      users: formattedUsers,
      total,
      limit,
      offset,
    });
    
  } catch (error: any) {
    logger.error('Failed to get admin users', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { userId, updates } = body;
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: updates.displayName,
        email: updates.email,
        status: updates.status,
      },
    });
    
    logger.info('Admin updated user', { 
      adminId: decoded.userId,
      updatedUserId: userId,
      updates 
    });
    
    return NextResponse.json({ user: updatedUser });
    
  } catch (error: any) {
    logger.error('Failed to update user', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}