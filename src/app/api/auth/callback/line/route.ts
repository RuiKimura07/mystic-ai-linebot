import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=invalid_request', request.url));
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
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
    
    // Create JWT token
    const jwtToken = jwt.sign(
      {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    // Set cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return response;
  } catch (error) {
    console.error('LINE authentication error:', error);
    return NextResponse.redirect(new URL('/login?error=authentication_failed', request.url));
  }
}