// 環境変数の型定義と検証
export const env = {
  // アプリケーション設定
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // LINE設定
  LINE_CHANNEL_ID: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID || '',
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || '',
  LINE_REDIRECT_URI: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || '',
  LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN || '',
  
  // JWT設定
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Stripe設定
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // OpenAI設定
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // セキュリティ設定
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  SESSION_SECRET: process.env.SESSION_SECRET || 'session-secret-key-change-in-production',
  
  // デモモード
  DEMO_MODE: process.env.DEMO_MODE === 'true',
} as const;

// 必須環境変数のチェック
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_APP_URL',
    'JWT_SECRET',
  ];
  
  const missing: string[] = [];
  
  // デモモードでない場合は追加の環境変数が必要
  if (!env.DEMO_MODE) {
    required.push(
      'NEXT_PUBLIC_LINE_CHANNEL_ID',
      'LINE_CHANNEL_SECRET',
      'NEXT_PUBLIC_LINE_REDIRECT_URI',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
    );
  }
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing required environment variables: ${missing.join(', ')}`);
    if (env.NODE_ENV === 'production' && !env.DEMO_MODE) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  // セキュリティ警告
  if (env.NODE_ENV === 'production') {
    if (env.JWT_SECRET === 'default-secret-key-change-in-production') {
      console.error('⚠️ WARNING: Using default JWT secret in production is insecure!');
    }
    if (env.ADMIN_PASSWORD === 'admin123') {
      console.error('⚠️ WARNING: Using default admin password in production is insecure!');
    }
  }
  
  return true;
}