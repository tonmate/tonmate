/**
 * Simple logging utility
 */
export class Logger {
  static log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(data && { data })
    };

    console.log(JSON.stringify(logEntry, null, 2));
  }

  static info(message, data = null) {
    this.log('info', message, data);
  }

  static warn(message, data = null) {
    this.log('warn', message, data);
  }

  static error(message, data = null) {
    this.log('error', message, data);
  }

  static debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }
}

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });

  next();
};