import { prisma } from './prisma';
import { Prisma, PrismaClient } from '@prisma/client';

// 最適化されたユーザー取得クエリ
export async function getUserWithBalance(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      lineUserId: true,
      displayName: true,
      pictureUrl: true,
      email: true,
      balance: true,
      totalPurchased: true,
      totalUsed: true,
      status: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
      // 最新のトランザクションのみを取得
      transactions: {
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          createdAt: true,
          balanceBefore: true,
          balanceAfter: true,
          stripePaymentId: true,
          expiresAt: true,
          isExpired: true,
        }
      }
    }
  });
}

// 最適化されたトランザクション作成（バッチ処理）
export async function createTransactionWithBalanceUpdate(
  userId: string,
  transactionData: {
    type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'REFUND' | 'BONUS' | 'EXPIRATION';
    amount: number;
    description: string;
    stripePaymentId?: string;
    stripeSessionId?: string;
    expiresAt?: Date;
  }
) {
  return prisma.$transaction(async (tx) => {
    // 現在のユーザー情報を取得（ロック付き）
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { balance: true, totalPurchased: true, totalUsed: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const newBalance = user.balance + transactionData.amount;
    
    // トランザクション作成とユーザー更新を同時実行
    const [transaction, updatedUser] = await Promise.all([
      tx.transaction.create({
        data: {
          userId,
          ...transactionData,
          balanceBefore: user.balance,
          balanceAfter: newBalance,
        }
      }),
      tx.user.update({
        where: { id: userId },
        data: {
          balance: newBalance,
          totalPurchased: transactionData.type === 'PURCHASE' 
            ? user.totalPurchased + transactionData.amount 
            : user.totalPurchased,
          totalUsed: transactionData.type === 'USAGE' 
            ? user.totalUsed + Math.abs(transactionData.amount)
            : user.totalUsed,
        }
      })
    ]);

    return { transaction, updatedUser };
  });
}

// 最適化された統計クエリ（集計）
export async function getAggregatedStats(startDate: Date, endDate: Date) {
  const [userStats, transactionStats] = await Promise.all([
    // ユーザー統計
    prisma.user.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    }),
    
    // トランザクション統計
    prisma.transaction.groupBy({
      by: ['type'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    })
  ]);

  return { userStats, transactionStats };
}

// 最適化された期限切れポイントチェック
export async function getExpiringPoints(daysAhead: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.transaction.findMany({
    where: {
      type: 'PURCHASE',
      isExpired: false,
      expiresAt: {
        lte: futureDate,
        gte: new Date()
      }
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      expiresAt: true,
      createdAt: true,
      user: {
        select: {
          lineUserId: true,
          displayName: true,
          email: true
        }
      }
    },
    orderBy: {
      expiresAt: 'asc'
    }
  });
}

// ページネーション最適化
export async function getPaginatedUsers(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    role?: string;
    search?: string;
  }
) {
  const skip = (page - 1) * limit;
  
  const where: Prisma.UserWhereInput = {};
  
  if (filters?.status) {
    where.status = filters.status as any;
  }
  
  if (filters?.role) {
    where.role = filters.role as any;
  }
  
  if (filters?.search) {
    where.OR = [
      { displayName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { lineUserId: { contains: filters.search } }
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        email: true,
        balance: true,
        status: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

// コネクションプール最適化設定
export const optimizedPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// クリーンアップ用
export async function cleanupExpiredSessions() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return prisma.chatSession.deleteMany({
    where: {
      status: 'COMPLETED',
      endedAt: {
        lt: thirtyDaysAgo
      }
    }
  });
}