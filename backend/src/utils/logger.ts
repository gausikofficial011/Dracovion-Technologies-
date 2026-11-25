type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

class Logger {
  private format(level: LogLevel, message: string, metadata?: Record<string, unknown>, err?: Error): string {
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    if (err) {
      payload.error = {
        message: err.message,
        name: err.name,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
      };
    }

    return JSON.stringify(payload);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    console.log(this.format('info', message, metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    console.warn(this.format('warn', message, metadata));
  }

  error(message: string, err?: Error | unknown, metadata?: Record<string, unknown>) {
    const errorObj = err instanceof Error ? err : undefined;
    const meta = errorObj ? metadata : { ...metadata, rawError: err };
    console.error(this.format('error', message, meta, errorObj));
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.format('debug', message, metadata));
    }
  }
}

export const logger = new Logger();
