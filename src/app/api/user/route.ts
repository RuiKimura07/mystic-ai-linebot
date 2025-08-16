import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      logger.warn('Unauthorized API request - no auth token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        pictureUrl: user.pictureUrl,
        email: user.email,
        balance: user.balance,
        totalPurchased: user.totalPurchased,
        totalUsed: user.totalUsed,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        transactions: user.transactions,
      },
    });
    
  } catch (error: any) {
    logger.error('Failed to get user info', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
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
    const body = await request.json();
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: decoded.userId,
      },
      data: {
        displayName: body.displayName,
        email: body.email,
      },
    });
    
    logger.info('User profile updated', { userId: updatedUser.id });
    
    return NextResponse.json({
      user: updatedUser,
    });
    
  } catch (error: any) {
    logger.error('Failed to update user profile', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}