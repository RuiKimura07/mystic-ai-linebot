// ロギングユーティリティ
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;
  
  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    this.level = LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  }
  
  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level}] ${message}`;
    return data ? `${base} ${JSON.stringify(data)}` : base;
  }
  
  error(message: string, error?: any) {
    if (this.level >= LogLevel.ERROR) {
      console.error(this.formatMessage('ERROR', message, error));
      
      // 本番環境ではエラー追跡サービスに送信
      if (process.env.NODE_ENV === 'production') {
        // Sentry, LogRocket, etc.に送信
        this.sendToErrorTracking(message, error);
      }
    }
  }
  
  warn(message: string, data?: any) {
    if (this.level >= LogLevel.WARN) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }
  
  info(message: string, data?: any) {
    if (this.level >= LogLevel.INFO) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }
  
  debug(message: string, data?: any) {
    if (this.level >= LogLevel.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }
  
  // アクセスログ
  access(method: string, path: string, statusCode: number, duration: number) {
    this.info(`${method} ${path} ${statusCode} ${duration}ms`);
  }
  
  // セキュリティイベント
  security(event: string, details: any) {
    this.warn(`SECURITY: ${event}`, details);
  }
  
  private sendToErrorTracking(message: string, error: any) {
    // エラー追跡サービスへの送信実装
    // 例: Sentry.captureException(error);
  }
}

export const logger = new Logger();