import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      logger.warn('LINE callback missing code parameter');
      return NextResponse.redirect(new URL('/login?error=missing_code', env.APP_URL));
    }
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.LINE_REDIRECT_URI,
        client_id: env.LINE_LOGIN_CHANNEL_ID,
        client_secret: env.LINE_LOGIN_CHANNEL_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    const { access_token, id_token } = tokenResponse.data;
    
    // Get user profile
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    const profile = profileResponse.data;
    
    // Save or update user in database
    const user = await prisma.user.upsert({
      where: {
        lineUserId: profile.userId,
      },
      update: {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || null,
        statusMessage: profile.statusMessage || null,
        lastLoginAt: new Date(),
      },
      create: {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl || null,
        statusMessage: profile.statusMessage || null,
        lastLoginAt: new Date(),
      },
    });
    
    logger.info('User logged in successfully', { userId: user.id, lineUserId: user.lineUserId });
    
    // Create JWT token
    const signOptions: SignOptions = {
      expiresIn: '7d',
    };
    
    const token = jwt.sign(
      {
        userId: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        role: user.role,
      },
      env.JWT_SECRET,
      signOptions
    );
    
    // Set cookie and redirect
    const dashboardUrl = new URL('/dashboard', env.APP_URL);
    const response = NextResponse.redirect(dashboardUrl);
    
    // Get domain from request URL for cookie domain
    const url = new URL(request.url);
    const cookieOptions = {
      httpOnly: false, // 一時的にfalseに設定（本番環境ではtrueにすべき）
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      // Remove explicit domain to see if that helps
    };
    
    // Try both methods of setting cookies
    response.cookies.set('auth-token', token, cookieOptions);
    
    // Also try setting via Set-Cookie header directly
    const cookieString = `auth-token=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; ${
      env.NODE_ENV === 'production' ? 'Secure; SameSite=None' : 'SameSite=Lax'
    }`;
    response.headers.append('Set-Cookie', cookieString);
    
    logger.info('Setting auth cookie', { 
      userId: user.id, 
      cookieOptions,
      cookieString,
      redirectUrl: dashboardUrl.toString(),
      tokenLength: token.length 
    });
    
    return response;
    
  } catch (error: any) {
    logger.error('LINE authentication failed', error);
    
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'authentication_failed')}`, env.APP_URL)
    );
  }
}