import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    logger.info('LINE callback received', { 
      url: request.url,
      searchParams: Object.fromEntries(request.nextUrl.searchParams),
    });
    
    // Check required environment variables
    if (!env.LINE_LOGIN_CHANNEL_ID || !env.LINE_LOGIN_CHANNEL_SECRET || !env.LINE_REDIRECT_URI) {
      logger.error('Missing LINE environment variables', {
        hasChannelId: !!env.LINE_LOGIN_CHANNEL_ID,
        hasChannelSecret: !!env.LINE_LOGIN_CHANNEL_SECRET,
        hasRedirectUri: !!env.LINE_REDIRECT_URI,
      });
      return NextResponse.redirect(new URL('/login?error=configuration_error', env.APP_URL));
    }
    
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    if (error) {
      logger.warn('LINE callback received error', { error });
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, env.APP_URL));
    }
    
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
      httpOnly: true, // 本番環境ではtrueにしてセキュリティを強化
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };
    
    // Set authentication cookie
    response.cookies.set('auth-token', token, cookieOptions);
    
    logger.info('User authentication successful', { 
      userId: user.id, 
      lineUserId: user.lineUserId,
      redirectUrl: dashboardUrl.toString()
    });
    
    return response;
    
  } catch (error: any) {
    logger.error('LINE authentication failed', {
      error: error.message,
      stack: error.stack,
      status: error.response?.status,
      data: error.response?.data,
      url: request.url,
    });
    
    const errorMessage = error.response?.data?.error_description || 
                        error.response?.data?.error || 
                        error.message || 
                        'authentication_failed';
    
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, env.APP_URL)
    );
  }
}