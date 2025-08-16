import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Debug endpoint to test cookie functionality
    const authToken = request.cookies.get('auth-token')?.value;
    const allCookies = request.headers.get('cookie');
    
    logger.info('Cookie test endpoint called', {
      authTokenExists: !!authToken,
      authTokenLength: authToken?.length || 0,
      allCookies,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    });
    
    return NextResponse.json({
      success: true,
      cookies: {
        authTokenExists: !!authToken,
        authTokenLength: authToken?.length || 0,
        allCookies,
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
    });
    
  } catch (error: any) {
    logger.error('Cookie test failed', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Set a test cookie
    const response = NextResponse.json({ success: true, message: 'Test cookie set' });
    
    response.cookies.set('test-cookie', 'test-value', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });
    
    logger.info('Test cookie set');
    return response;
    
  } catch (error: any) {
    logger.error('Setting test cookie failed', error);
    return NextResponse.json({ error: 'Failed to set cookie' }, { status: 500 });
  }
}