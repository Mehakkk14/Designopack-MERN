/**
 * Development Logger Utility
 *
 * This utility provides logging functionality that is:
 * - Only active in development mode
 * - Removed/disabled in production builds
 * - Maintains consistent logging format
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.log('Info message');
 *   logger.error('Error message'); // Always logged
 *   logger.warn('Warning message');
 *   logger.debug('Debug info');
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Format timestamp for logs
 */
const getTimestamp = (): string => {
  return new Date().toISOString().split("T")[1].split(".")[0];
};

/**
 * Development Logger
 * Only logs in development mode, silent in production
 */
export const logger = {
  /**
   * Log general information (development only)
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(
        `${colors.cyan}[INFO ${getTimestamp()}]${colors.reset}`,
        ...args,
      );
    }
  },

  /**
   * Log errors (always logged, even in production for error tracking)
   */
  error: (...args: unknown[]): void => {
    console.error(
      `${colors.red}[ERROR ${getTimestamp()}]${colors.reset}`,
      ...args,
    );

    // In production, you might want to send to error tracking service
    if (isProduction) {
      // TODO: Send to Sentry, LogRocket, or other error tracking service
      // Example: Sentry.captureException(args[0]);
    }
  },

  /**
   * Log warnings (development only)
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(
        `${colors.yellow}[WARN ${getTimestamp()}]${colors.reset}`,
        ...args,
      );
    }
  },

  /**
   * Log debug information (development only)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(
        `${colors.magenta}[DEBUG ${getTimestamp()}]${colors.reset}`,
        ...args,
      );
    }
  },

  /**
   * Log success messages (development only)
   */
  success: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(
        `${colors.green}[SUCCESS ${getTimestamp()}]${colors.reset}`,
        ...args,
      );
    }
  },

  /**
   * Group related logs together (development only)
   */
  group: (label: string): void => {
    if (isDevelopment) {
      console.group(`${colors.blue}${label}${colors.reset}`);
    }
  },

  /**
   * End log group (development only)
   */
  groupEnd: (): void => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log table data (development only)
   */
  table: (data: unknown): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Log with emoji prefixes for better visibility (development only)
   */
  emoji: {
    loading: (...args: unknown[]): void => {
      if (isDevelopment) console.log("🔄", ...args);
    },
    success: (...args: unknown[]): void => {
      if (isDevelopment) console.log("✅", ...args);
    },
    error: (...args: unknown[]): void => {
      console.error("❌", ...args);
    },
    warning: (...args: unknown[]): void => {
      if (isDevelopment) console.warn("⚠️", ...args);
    },
    info: (...args: unknown[]): void => {
      if (isDevelopment) console.log("ℹ️", ...args);
    },
    search: (...args: unknown[]): void => {
      if (isDevelopment) console.log("🔍", ...args);
    },
  },
};

/**
 * Performance logger for measuring execution time
 */
export const perfLogger = {
  /**
   * Start timing an operation
   */
  start: (label: string): void => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  /**
   * End timing an operation
   */
  end: (label: string): void => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

// Export default logger
export default logger;
