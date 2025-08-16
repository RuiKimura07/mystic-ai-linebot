import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// セキュリティ：この API は特別なマスターキーがないと実行できない
const MASTER_KEY = 'mystic-admin-setup-2024';

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName, masterKey } = await request.json();
    
    // マスターキー検証
    if (masterKey !== MASTER_KEY) {
      logger.warn('Unauthorized admin creation attempt', { email });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください' },
        { status: 400 }
      );
    }
    
    // パスワードの強度チェック
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      );
    }
    
    // 既存のユーザーチェック
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { AND: [{ role: 'ADMIN' }, { email: email }] }
        ]
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    // パスワードハッシュ化
    const saltRounds = 12;
    const passwordHash = await bcryptjs.hash(password, saltRounds);
    
    // 管理者ユーザー作成
    const adminUser = await prisma.user.create({
      data: {
        lineUserId: `admin_${Date.now()}`, // 管理者用の一意ID
        displayName: displayName,
        email: email,
        passwordHash: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        balance: 0, // 管理者はポイントを持たない
        totalPurchased: 0,
        totalUsed: 0,
      },
    });
    
    logger.info('Admin user created successfully', {
      userId: adminUser.id,
      email: adminUser.email,
      displayName: adminUser.displayName,
    });
    
    return NextResponse.json({
      success: true,
      message: '管理者アカウントが作成されました',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        displayName: adminUser.displayName,
        role: adminUser.role,
      },
    });
    
  } catch (error: any) {
    logger.error('Admin user creation error', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'アカウント作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}