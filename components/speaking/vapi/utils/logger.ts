/**
 * Conditional Logger Utility
 *
 * Provides structured logging that only outputs in development mode.
 * Replaces scattered console.log statements with a centralized, controllable logging system.
 */

const isDev = process.env.NODE_ENV === 'development';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  /** Additional data to log */
  data?: Record<string, any>;
  /** Force log even in production */
  force?: boolean;
}

/**
 * Format log message with timestamp and prefix
 */
function formatMessage(level: LogLevel, prefix: string, message: string): string {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  return `[${timestamp}] [${prefix}] ${message}`;
}

/**
 * Create a namespaced logger instance
 */
export function createLogger(namespace: string) {
  const prefix = namespace.toUpperCase();

  return {
    /**
     * Debug level - only in development, for detailed tracing
     */
    debug: (message: string, options?: LogOptions) => {
      if (isDev || options?.force) {
        console.log(formatMessage('debug', prefix, message), options?.data ?? '');
      }
    },

    /**
     * Info level - general information
     */
    info: (message: string, options?: LogOptions) => {
      if (isDev || options?.force) {
        console.log(formatMessage('info', prefix, message), options?.data ?? '');
      }
    },

    /**
     * Warning level - potential issues
     */
    warn: (message: string, options?: LogOptions) => {
      if (isDev || options?.force) {
        console.warn(formatMessage('warn', prefix, message), options?.data ?? '');
      }
    },

    /**
     * Error level - always logs, even in production
     */
    error: (message: string, options?: LogOptions) => {
      console.error(formatMessage('error', prefix, message), options?.data ?? '');
    },

    /**
     * Timing utilities for performance measurement
     */
    time: (label: string) => {
      if (isDev) {
        console.time(`[${prefix}] ${label}`);
      }
    },

    timeEnd: (label: string) => {
      if (isDev) {
        console.timeEnd(`[${prefix}] ${label}`);
      }
    },
  };
}

/**
 * Pre-configured loggers for different modules
 */
export const vapiLogger = createLogger('VAPI');
export const callLogger = createLogger('CALL');
export const sessionLogger = createLogger('SESSION');
export const micLogger = createLogger('MIC');
export const apiLogger = createLogger('API');

/**
 * Default logger instance
 */
export const logger = createLogger('APP');

export default logger;
