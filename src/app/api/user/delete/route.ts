import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function DELETE(request: NextRequest) {
  try {
    // JWT トークンからユーザー情報を取得
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const userId = decoded.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    logger.info('Account deletion request', { userId });
    
    // ユーザーが存在するかチェック
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        displayName: true, 
        email: true,
        status: true
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (user.status === 'DELETED') {
      return NextResponse.json({ error: 'Account already deleted' }, { status: 400 });
    }
    
    // トランザクション内でユーザーデータを削除
    await prisma.$transaction(async (tx) => {
      // 1. すべてのトランザクション記録を削除
      await tx.transaction.deleteMany({
        where: { userId: userId },
      });
      
      // 2. チャット履歴を削除（将来実装される場合）
      // await tx.chatHistory.deleteMany({
      //   where: { userId: userId },
      // });
      
      // 3. ユーザー情報を完全に削除
      await tx.user.delete({
        where: { id: userId },
      });
    });
    
    logger.info('Account successfully deleted', { 
      userId, 
      userEmail: user.email,
      userName: user.displayName 
    });
    
    // レスポンスでクッキーをクリア
    const response = NextResponse.json({
      success: true,
      message: 'アカウントが正常に削除されました',
    });
    
    // auth-tokenクッキーを削除
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 0,
      path: '/',
    });
    
    return response;
    
  } catch (error: any) {
    logger.error('Account deletion failed', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'アカウント削除処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}