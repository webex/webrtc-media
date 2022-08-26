/* eslint-disable no-console */
import {setLogger} from '../logger';

const getTimestampString = (): string => {
  return `${new Date().toISOString()}`;
};

/**
 * Implements the Logger interface for the purpose of
 * the unit tests. It just calls the standard console methods
 * but prepends the strings with a timestamp.
 */
class TestLogger {
  // eslint-disable-next-line class-methods-use-this
  info(...args: unknown[]) {
    console.info(getTimestampString(), ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  log(...args: unknown[]) {
    console.log(getTimestampString(), ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  error(...args: unknown[]) {
    console.error(getTimestampString(), ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  warn(...args: unknown[]) {
    console.warn(getTimestampString(), ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  trace(...args: unknown[]) {
    console.trace(getTimestampString(), ...args);
  }

  // eslint-disable-next-line class-methods-use-this
  debug(...args: unknown[]) {
    console.debug(getTimestampString(), ...args);
  }
}

export const setupTestLogger = () => {
  setLogger(new TestLogger());
};

export const teardownTestLogger = () => {
  setLogger(null);
};
