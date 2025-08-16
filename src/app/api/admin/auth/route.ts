import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    logger.info('Admin login attempt', { email });
    
    if (!email || !password) {
      logger.warn('Admin login with missing credentials', { email, hasPassword: !!password });
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
    
    logger.info('Admin user lookup result', { 
      email, 
      userFound: !!user, 
      userId: user?.id,
      hasPasswordHash: !!user?.passwordHash,
      userRole: user?.role 
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
    logger.info('Comparing password', { email, userId: user.id });
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    logger.info('Password comparison result', { email, userId: user.id, passwordMatch });
    
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
    
    const cookieOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    };
    
    response.cookies.set('admin-token', token, cookieOptions);
    
    logger.info('Setting admin cookie', { 
      cookieOptions,
      tokenLength: token.length,
      userId: user.id,
      nodeEnv: env.NODE_ENV,
      cookieName: 'admin-token'
    });
    
    // Additional debug logging
    console.log('Cookie setting debug:', {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      httpOnly: cookieOptions.httpOnly,
      path: cookieOptions.path,
      maxAge: cookieOptions.maxAge
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