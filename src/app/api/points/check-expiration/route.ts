import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendPushMessage } from '@/lib/line';

// 有効期限切れポイントをチェックして処理
export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    
    // 期限切れになったがまだ処理されていないトランザクションを取得
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        type: 'PURCHASE',
        expiresAt: {
          lte: now,
        },
        isExpired: false,
      },
      include: {
        user: true,
      },
    });

    logger.info(`Found ${expiredTransactions.length} expired transactions to process`);

    for (const transaction of expiredTransactions) {
      try {
        // トランザクション内で期限切れ処理
        await prisma.$transaction(async (tx) => {
          // 期限切れトランザクションを作成
          const expiredAmount = transaction.amount;
          const currentUser = await tx.user.findUnique({
            where: { id: transaction.userId },
          });

          if (!currentUser) {
            logger.error('User not found for expiration', { userId: transaction.userId });
            return;
          }

          // ユーザーの残高から期限切れポイントを減算
          const newBalance = Math.max(0, currentUser.balance - expiredAmount);
          
          // 期限切れトランザクションを記録
          await tx.transaction.create({
            data: {
              userId: transaction.userId,
              type: 'EXPIRATION',
              amount: -expiredAmount,
              description: `ポイント有効期限切れ (購入日: ${transaction.createdAt.toLocaleDateString('ja-JP')})`,
              balanceBefore: currentUser.balance,
              balanceAfter: newBalance,
            },
          });

          // 元のトランザクションを期限切れとしてマーク
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              isExpired: true,
              expiredAt: now,
            },
          });

          // ユーザーの残高を更新
          await tx.user.update({
            where: { id: transaction.userId },
            data: {
              balance: newBalance,
            },
          });

          logger.info('Processed expired points', {
            userId: transaction.userId,
            expiredAmount,
            newBalance,
            transactionId: transaction.id,
          });

          // LINE通知送信
          if (currentUser.lineUserId) {
            const message = {
              type: 'text',
              text: `⏰ ポイント有効期限のお知らせ\n\n${expiredAmount.toLocaleString()}ptが有効期限切れとなりました。\n\n購入日: ${transaction.createdAt.toLocaleDateString('ja-JP')}\n現在の残高: ${newBalance.toLocaleString()}pt\n\n※ポイントの有効期限は購入から6ヶ月です。お早めにご利用ください。`,
            };

            try {
              await sendPushMessage(currentUser.lineUserId, [message]);
            } catch (lineError) {
              logger.error('Failed to send expiration notification', { lineError, userId: transaction.userId });
            }
          }
        });
      } catch (error) {
        logger.error('Failed to process expired transaction', {
          transactionId: transaction.id,
          error,
        });
      }
    }

    // 30日以内に期限切れになるポイントを持つユーザーに警告通知
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const soonExpiringTransactions = await prisma.transaction.findMany({
      where: {
        type: 'PURCHASE',
        expiresAt: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
        isExpired: false,
      },
      include: {
        user: true,
      },
    });

    // ユーザーごとにグループ化して通知
    const userExpirations = new Map<string, { user: any; totalExpiring: number; earliestExpiration: Date }>();
    
    for (const transaction of soonExpiringTransactions) {
      const existing = userExpirations.get(transaction.userId);
      if (existing) {
        existing.totalExpiring += transaction.amount;
        if (transaction.expiresAt && transaction.expiresAt < existing.earliestExpiration) {
          existing.earliestExpiration = transaction.expiresAt;
        }
      } else {
        userExpirations.set(transaction.userId, {
          user: transaction.user,
          totalExpiring: transaction.amount,
          earliestExpiration: transaction.expiresAt!,
        });
      }
    }

    // 警告通知を送信
    for (const [userId, data] of userExpirations) {
      if (data.user.lineUserId) {
        const daysUntilExpiration = Math.ceil((data.earliestExpiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        const message = {
          type: 'text',
          text: `⚠️ ポイント有効期限のお知らせ\n\n${data.totalExpiring.toLocaleString()}ptが${daysUntilExpiration}日後に有効期限を迎えます。\n\n有効期限: ${data.earliestExpiration.toLocaleDateString('ja-JP')}\n現在の残高: ${data.user.balance.toLocaleString()}pt\n\nお早めにご利用ください！\n\n👉 占いチャット: ${process.env.APP_URL}/chat`,
        };

        try {
          await sendPushMessage(data.user.lineUserId, [message]);
        } catch (lineError) {
          logger.error('Failed to send expiration warning', { lineError, userId });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: expiredTransactions.length,
      warned: userExpirations.size,
    });

  } catch (error: any) {
    logger.error('Check expiration error', error);
    return NextResponse.json(
      { error: 'Failed to check expirations' },
      { status: 500 }
    );
  }
}