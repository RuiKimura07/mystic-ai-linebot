import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
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
    const token = jwt.sign(
      {
        userId: user.id,
        lineUserId: user.lineUserId,
        displayName: user.displayName,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN,
      }
    );
    
    // Set cookie and redirect
    const response = NextResponse.redirect(new URL('/dashboard', env.APP_URL));
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
    
  } catch (error: any) {
    logger.error('LINE authentication failed', error);
    
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'authentication_failed')}`, env.APP_URL)
    );
  }
}