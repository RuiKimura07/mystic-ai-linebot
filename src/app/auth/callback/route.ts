import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Redirect handler for incorrect LINE callback URL
// This handles the case where LINE is configured to use /auth/callback
// instead of the correct /api/auth/callback/line
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    
    logger.warn('Incorrect LINE callback URL used', {
      receivedUrl: request.url,
      correctUrl: '/api/auth/callback/line',
      code: !!code,
      state: !!state,
      error,
      message: 'Please update LINE_REDIRECT_URI environment variable and LINE console settings',
    });
    
    // Build the correct callback URL with all parameters
    const correctCallbackUrl = new URL('/api/auth/callback/line', request.url);
    
    // Preserve all query parameters
    searchParams.forEach((value, key) => {
      correctCallbackUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(correctCallbackUrl);
    
  } catch (error: any) {
    logger.error('Failed to redirect LINE callback', error);
    return NextResponse.redirect(new URL('/login?error=callback_redirect_failed', request.url));
  }
}