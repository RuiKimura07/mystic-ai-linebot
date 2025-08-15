import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// レート制限のための簡易的なメモリストア
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const response = NextResponse.next();
  
  // セキュリティヘッダーの追加
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // HTTPS強制（本番環境のみ）
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  
  // CSPヘッダー
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://api.line.me",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  ];
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  
  // APIエンドポイントのレート制限
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                request.headers.get('cf-connecting-ip') ||
                'unknown';
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();
    
    // レート制限の設定（1分間に60リクエストまで）
    const limit = 60;
    const windowMs = 60 * 1000; // 1分
    
    const record = rateLimitStore.get(key);
    
    if (!record || record.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    } else if (record.count >= limit) {
      logger.warn('Rate limit exceeded', { ip, path: request.nextUrl.pathname });
      
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        },
      });
    } else {
      record.count++;
      rateLimitStore.set(key, record);
    }
    
    // レート制限ヘッダーの追加
    const currentRecord = rateLimitStore.get(key)!;
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(limit - currentRecord.count));
    response.headers.set('X-RateLimit-Reset', new Date(currentRecord.resetTime).toISOString());
  }
  
  // アクセスログ
  const duration = Date.now() - startTime;
  logger.access(
    request.method,
    request.nextUrl.pathname,
    response.status,
    duration
  );
  
  // 古いレート制限レコードのクリーンアップ（メモリリーク防止）
  if (Math.random() < 0.01) { // 1%の確率で実行
    const cleanupTime = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime < cleanupTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};