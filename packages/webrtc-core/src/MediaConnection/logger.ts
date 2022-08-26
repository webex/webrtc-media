/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Logger {
  info: (...args: any[]) => void;
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  trace: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

// this default logger is used if setLogger() is not called at all
// or if it's called with null
const defaultLogger: Logger = {
  info: (...args: any[]) => console.info(...args),
  log: (...args: any[]) => console.log(...args),
  error: (...args: any[]) => console.error(...args),
  warn: (...args: any[]) => console.warn(...args),
  trace: (...args: any[]) => console.trace(...args),
  debug: (...args: any[]) => console.debug(...args),
};

let currentLogger: Logger = defaultLogger;

/**
 * Sets a logger to be used by all MediaConnection modules.
 * If this function is not called at all, by default all logs just
 * go to the console.
 *
 * @param newLogger - instance of a class that implements the Logger interface,
 *                    use null if you want to unset a previously set logger
 */
export const setLogger = (newLogger: Logger | null) => {
  if (newLogger) {
    currentLogger = newLogger;
  } else {
    currentLogger = defaultLogger;
  }
};

/**
 * Gets current logger.
 *
 * @returns current logger
 */
export const getLogger = (): Logger => currentLogger;

/**
 * Takes an Error object and returns a string containing
 * the error message and a stack trace. Useful for logging.
 *
 * @param error - error object
 * @returns string - string containing error description and stack trace
 */
export const getErrorDescription = (error?: Error): string => {
  // eslint-disable-next-line no-nested-ternary
  return error ? (error.stack ? `${error.message}: ${error.stack}` : `${error}`) : '';
};
