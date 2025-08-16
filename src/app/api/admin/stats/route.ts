import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // 管理者認証チェック
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No admin token' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    if (decoded.role !== 'ADMIN' || decoded.type !== 'admin') {
      return NextResponse.json({ error: 'Not an admin user' }, { status: 403 });
    }
    
    // クエリパラメータから期間を取得
    const range = request.nextUrl.searchParams.get('range') || 'month';
    
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    // 統計データを集計
    const [
      totalUsers,
      activeUsers,
      todayNewUsers,
      monthlyNewUsers,
      transactions,
      recentTransactions
    ] = await Promise.all([
      // 総ユーザー数
      prisma.user.count({
        where: { status: 'ACTIVE' }
      }),
      
      // アクティブユーザー（30日以内にログイン）
      prisma.user.count({
        where: {
          status: 'ACTIVE',
          lastLoginAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // 今日の新規ユーザー
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(now.toDateString())
          }
        }
      }),
      
      // 月間新規ユーザー
      prisma.user.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // 取引データ
      prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        include: {
          user: {
            select: {
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      
      // 最近の取引（10件）
      prisma.transaction.findMany({
        take: 10,
        include: {
          user: {
            select: {
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);
    
    // 売上計算
    const todayRevenue = transactions
      .filter(t => 
        t.type === 'PURCHASE' && 
        t.createdAt >= new Date(now.toDateString())
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyRevenue = transactions
      .filter(t => t.type === 'PURCHASE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalRevenue = await prisma.transaction.aggregate({
      where: { type: 'PURCHASE' },
      _sum: { amount: true }
    });
    
    const totalPoints = await prisma.user.aggregate({
      _sum: { balance: true }
    });
    
    // 日別グループ化（グラフ用）
    const days = range === 'week' ? 7 : range === 'month' ? 30 : 365;
    const dayStep = range === 'year' ? 30 : 1; // 年間表示は月単位
    
    const userGrowth = [];
    const revenueGrowth = [];
    
    for (let i = 0; i < Math.min(days / dayStep, 12); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i * dayStep));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStart = new Date(date.toDateString());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + dayStep);
      
      const dayUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      });
      
      const dayRevenue = transactions
        .filter(t => 
          t.type === 'PURCHASE' &&
          t.createdAt >= dayStart &&
          t.createdAt < dayEnd
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      userGrowth.unshift({ date: dateStr, count: dayUsers });
      revenueGrowth.unshift({ date: dateStr, amount: dayRevenue });
    }
    
    const stats = {
      totalUsers,
      activeUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPoints: totalPoints._sum.balance || 0,
      todayRevenue,
      todayNewUsers,
      monthlyRevenue,
      monthlyNewUsers,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        user: t.user.displayName,
        type: t.type,
        amount: t.amount,
        createdAt: t.createdAt.toISOString()
      })),
      userGrowth,
      revenueGrowth
    };
    
    logger.info('Admin stats fetched', { 
      adminId: decoded.userId,
      range 
    });
    
    return NextResponse.json(stats);
    
  } catch (error: any) {
    logger.error('Admin stats error', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    return NextResponse.json({ error: 'Stats fetch failed' }, { status: 500 });
  }
}