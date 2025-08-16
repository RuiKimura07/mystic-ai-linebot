import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

// Redis接続設定
const redisConfig = {
  host: env.REDIS_HOST || 'localhost',
  port: parseInt(env.REDIS_PORT || '6379'),
  password: env.REDIS_PASSWORD,
  db: parseInt(env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

// Redisクライアントインスタンス
let redis: Redis | null = null;

// Redis接続を取得
export function getRedisClient(): Redis | null {
  if (!env.REDIS_HOST && process.env.NODE_ENV === 'production') {
    logger.warn('Redis is not configured in production');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(redisConfig);
      
      redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
      });

      redis.on('close', () => {
        logger.info('Redis connection closed');
      });

    } catch (error) {
      logger.error('Failed to create Redis client:', error);
      return null;
    }
  }

  return redis;
}

// キャッシュヘルパー関数
export const cache = {
  // キャッシュから取得
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) return null;

    try {
      const data = await client.get(key);
      if (!data) return null;
      
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  // キャッシュに保存
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const data = JSON.stringify(value);
      
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, data);
      } else {
        await client.set(key, data);
      }
      
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  // キャッシュから削除
  async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  // パターンで削除
  async deletePattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;

    try {
      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;
      
      const deleted = await client.del(...keys);
      return deleted;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  },

  // TTLを更新
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return false;

    try {
      const result = await client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      logger.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  },
};

// セッション管理用ヘルパー
export const sessionCache = {
  // セッションを保存
  async set(sessionId: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
    return cache.set(`session:${sessionId}`, data, ttlSeconds);
  },

  // セッションを取得
  async get<T>(sessionId: string): Promise<T | null> {
    return cache.get<T>(`session:${sessionId}`);
  },

  // セッションを削除
  async delete(sessionId: string): Promise<boolean> {
    return cache.delete(`session:${sessionId}`);
  },

  // セッションを延長
  async extend(sessionId: string, ttlSeconds: number = 3600): Promise<boolean> {
    return cache.expire(`session:${sessionId}`, ttlSeconds);
  },
};

// ユーザーデータキャッシュ
export const userCache = {
  // ユーザー情報をキャッシュ
  async set(userId: string, userData: any, ttlSeconds: number = 300): Promise<boolean> {
    return cache.set(`user:${userId}`, userData, ttlSeconds);
  },

  // ユーザー情報を取得
  async get<T>(userId: string): Promise<T | null> {
    return cache.get<T>(`user:${userId}`);
  },

  // ユーザー情報を削除
  async delete(userId: string): Promise<boolean> {
    return cache.delete(`user:${userId}`);
  },

  // ユーザーの全キャッシュをクリア
  async clearAll(userId: string): Promise<number> {
    return cache.deletePattern(`user:${userId}:*`);
  },
};

// レート制限用
export const rateLimiter = {
  // レート制限チェック
  async check(key: string, limit: number, windowSeconds: number): Promise<boolean> {
    const client = getRedisClient();
    if (!client) return true; // Redisが無い場合は制限しない

    try {
      const current = await client.incr(key);
      
      if (current === 1) {
        await client.expire(key, windowSeconds);
      }
      
      return current <= limit;
    } catch (error) {
      logger.error(`Rate limit check error for key ${key}:`, error);
      return true; // エラー時は制限しない
    }
  },

  // 残りの試行回数を取得
  async remaining(key: string, limit: number): Promise<number> {
    const client = getRedisClient();
    if (!client) return limit;

    try {
      const current = await client.get(key);
      const used = current ? parseInt(current) : 0;
      return Math.max(0, limit - used);
    } catch (error) {
      logger.error(`Rate limit remaining error for key ${key}:`, error);
      return limit;
    }
  },

  // TTLを取得
  async ttl(key: string): Promise<number> {
    const client = getRedisClient();
    if (!client) return 0;

    try {
      return await client.ttl(key);
    } catch (error) {
      logger.error(`Rate limit TTL error for key ${key}:`, error);
      return 0;
    }
  },
};

// クリーンアップ
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis connection closed');
  }
}