import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      demoMode: env.DEMO_MODE,
      services: {
        app: 'operational',
        line: {
          configured: !!(env.LINE_CHANNEL_SECRET && env.LINE_CHANNEL_ID),
          status: env.DEMO_MODE ? 'demo_mode' : 'operational'
        },
        stripe: {
          configured: !!(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY),
          status: env.DEMO_MODE ? 'demo_mode' : 'operational'
        },
        jwt: {
          configured: !!env.JWT_SECRET,
          status: 'operational'
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      uptime: Math.round(process.uptime()),
    };
    
    logger.debug('Health check performed', health);
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    logger.error('Health check failed', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    );
  }
}