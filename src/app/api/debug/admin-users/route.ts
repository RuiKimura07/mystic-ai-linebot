import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// デバッグ用エンドポイント - 本番環境では削除予定
export async function GET(request: NextRequest) {
  try {
    // セキュリティ：デバッグキーが必要
    const debugKey = request.nextUrl.searchParams.get('debug');
    if (debugKey !== 'mystic-debug-admin-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 管理者ユーザーを取得（パスワードハッシュは除外）
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        createdAt: true,
        passwordHash: false, // パスワードハッシュは表示しない
      },
    });

    // パスワードハッシュの存在だけチェック
    const adminUsersWithHashInfo = await Promise.all(
      adminUsers.map(async (user) => {
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { passwordHash: true },
        });
        
        return {
          ...user,
          hasPasswordHash: !!fullUser?.passwordHash,
        };
      })
    );

    logger.info('Debug: Admin users query', { count: adminUsersWithHashInfo.length });

    return NextResponse.json({
      adminUsers: adminUsersWithHashInfo,
      totalCount: adminUsersWithHashInfo.length,
    });

  } catch (error: any) {
    logger.error('Debug admin users query failed', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}