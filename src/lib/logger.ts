import { NextRequest } from 'next/server';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    // Set log level from environment
    const envLogLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel;
    if (envLogLevel && Object.values(LogLevel).includes(envLogLevel)) {
      this.logLevel = envLogLevel;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    request?: NextRequest,
    userId?: string
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      entry.stack = error.stack;
    }

    if (request) {
      entry.requestId = request.headers.get('x-request-id') || undefined;
      entry.ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
      entry.userAgent = request.headers.get('user-agent') || undefined;
      entry.url = request.url;
      entry.method = request.method;
    }

    if (userId) {
      entry.userId = userId;
    }

    return entry;
  }

  private writeLog(entry: LogEntry): void {
    // In production, you might want to send logs to a service like DataDog, Sentry, etc.
    // For now, we'll use console with structured logging
    const logData = {
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.stack && { stack: entry.stack }),
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.userId && { userId: entry.userId }),
      ...(entry.ip && { ip: entry.ip }),
      ...(entry.userAgent && { userAgent: entry.userAgent }),
      ...(entry.url && { url: entry.url }),
      ...(entry.method && { method: entry.method }),
    };

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(JSON.stringify(logData, null, 2));
        break;
      case LogLevel.WARN:
        console.warn(JSON.stringify(logData, null, 2));
        break;
      case LogLevel.INFO:
        console.info(JSON.stringify(logData, null, 2));
        break;
      case LogLevel.DEBUG:
        console.debug(JSON.stringify(logData, null, 2));
        break;
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>, request?: NextRequest, userId?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error, request, userId);
    this.writeLog(entry);
  }

  warn(message: string, context?: Record<string, any>, request?: NextRequest, userId?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.createLogEntry(LogLevel.WARN, message, context, undefined, request, userId);
    this.writeLog(entry);
  }

  info(message: string, context?: Record<string, any>, request?: NextRequest, userId?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.createLogEntry(LogLevel.INFO, message, context, undefined, request, userId);
    this.writeLog(entry);
  }

  debug(message: string, context?: Record<string, any>, request?: NextRequest, userId?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, undefined, request, userId);
    this.writeLog(entry);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Error handler wrapper for API routes
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  operationName: string
) {
  return async (...args: T): Promise<Response> => {
    try {
      const result = await handler(...args);
      logger.info(`${operationName} completed successfully`, {
        operationName,
        status: result.status,
      });
      return result;
    } catch (error) {
      logger.error(`${operationName} failed`, error as Error, {
        operationName,
      });
      
      // Return generic error response
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  };
}

// Request logging middleware
export function logRequest(request: NextRequest, userId?: string): void {
  logger.info('API request received', {
    method: request.method,
    url: request.url,
    contentType: request.headers.get('content-type'),
  }, request, userId);
}

// Performance monitoring
export function withPerformanceMonitoring<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  operationName: string
) {
  return async (...args: T): Promise<Response> => {
    const startTime = Date.now();
    
    try {
      const result = await handler(...args);
      const duration = Date.now() - startTime;
      
      logger.info(`${operationName} performance`, {
        operationName,
        duration,
        status: result.status,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`${operationName} error`, error as Error, {
        operationName,
        duration,
      });
      throw error;
    }
  };
}

export default logger;
