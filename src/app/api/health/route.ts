import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 基本的なヘルスチェック
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        line: {
          configured: !!(process.env.LINE_CHANNEL_SECRET && process.env.NEXT_PUBLIC_LINE_CHANNEL_ID),
          status: 'available'
        },
        stripe: {
          configured: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
          status: 'available'
        },
        jwt: {
          configured: !!process.env.JWT_SECRET,
          status: 'available'
        }
      }
    };

    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}