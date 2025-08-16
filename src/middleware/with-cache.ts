import { NextRequest, NextResponse } from 'next/server';
import { cache, rateLimiter } from '@/lib/redis';
import { logger } from '@/lib/logger';

// キャッシュミドルウェア
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFunction: () => Promise<T>
): Promise<T> {
  try {
    // キャッシュから取得を試みる
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      logger.debug(`Cache hit for key: ${key}`);
      return cached;
    }

    // キャッシュミスの場合、データを取得
    logger.debug(`Cache miss for key: ${key}`);
    const data = await fetchFunction();

    // キャッシュに保存（非同期で実行）
    cache.set(key, data, ttlSeconds).catch(error => {
      logger.error('Failed to cache data:', error);
    });

    return data;
  } catch (error) {
    logger.error('Cache middleware error:', error);
    // エラー時は直接データを取得
    return fetchFunction();
  }
}

// レート制限ミドルウェア
export async function withRateLimit(
  request: NextRequest,
  options: {
    key?: string;
    limit?: number;
    window?: number;
  } = {}
): Promise<NextResponse | null> {
  const {
    key = request.ip || 'unknown',
    limit = 100,
    window = 60
  } = options;

  const rateLimitKey = `rate_limit:${key}`;

  try {
    const allowed = await rateLimiter.check(rateLimitKey, limit, window);

    if (!allowed) {
      const remaining = await rateLimiter.remaining(rateLimitKey, limit);
      const retryAfter = await rateLimiter.ttl(rateLimitKey);

      logger.warn(`Rate limit exceeded for key: ${key}`);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'レート制限に達しました。しばらくしてから再試行してください。',
          retryAfter
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString(),
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    return null; // 制限内の場合は処理を続行
  } catch (error) {
    logger.error('Rate limit middleware error:', error);
    // エラー時は制限しない
    return null;
  }
}

// キャッシュ無効化ヘルパー
export async function invalidateCache(patterns: string[]): Promise<void> {
  try {
    const promises = patterns.map(pattern => cache.deletePattern(pattern));
    await Promise.all(promises);
    logger.info('Cache invalidated for patterns:', patterns);
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

// ユーザー関連のキャッシュを無効化
export async function invalidateUserCache(userId: string): Promise<void> {
  await invalidateCache([
    `user:${userId}`,
    `user:${userId}:*`,
    `session:*:${userId}`
  ]);
}

// 統計関連のキャッシュを無効化
export async function invalidateStatsCache(): Promise<void> {
  await invalidateCache([
    'stats:*',
    'admin:dashboard:*'
  ]);
}