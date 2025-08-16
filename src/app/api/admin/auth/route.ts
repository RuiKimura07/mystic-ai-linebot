import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください' },
        { status: 400 }
      );
    }
    
    // データベースから管理者ユーザーを検索
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    
    if (!user) {
      logger.warn('Admin login attempt with invalid credentials', { email });
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      );
    }
    
    // パスワードハッシュが存在しない場合（LINE認証のみのユーザー）
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'このアカウントはLINE認証専用です' },
        { status: 401 }
      );
    }
    
    // パスワード照合
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      logger.warn('Admin login attempt with wrong password', { email, userId: user.id });
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが間違っています' },
        { status: 401 }
      );
    }
    
    // 最終ログイン時刻を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    
    // JWT トークンを生成
    const signOptions: SignOptions = {
      expiresIn: '8h', // 管理者セッションは8時間
    };
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        type: 'admin', // 管理者トークンであることを明示
      },
      env.JWT_SECRET,
      signOptions
    );
    
    // クッキーにトークンを設定
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/admin',
    });
    
    logger.info('Admin user logged in successfully', {
      userId: user.id,
      email: user.email,
    });
    
    return response;
    
  } catch (error: any) {
    logger.error('Admin authentication error', error);
    return NextResponse.json(
      { error: 'ログイン処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}