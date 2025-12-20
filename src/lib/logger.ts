/**
 * Client-side logger utility
 * Provides structured logging for API errors and debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
      const entry = this.formatMessage('debug', message, context);
      console.debug(`[DEBUG] ${entry.timestamp}`, message, context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.formatMessage('info', message, context);
    if (this.isDevelopment) {
      console.info(`[INFO] ${entry.timestamp}`, message, context || '');
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.formatMessage('warn', message, context);
    console.warn(`[WARN] ${entry.timestamp}`, message, context || '');
  }

  error(message: string, context?: Record<string, any>) {
    const entry = this.formatMessage('error', message, context);
    console.error(`[ERROR] ${entry.timestamp}`, message, context || '');
    
    // In production, you could send to error tracking service here
    // e.g., Sentry, LogRocket, etc.
  }
}

export const logger = new Logger();
