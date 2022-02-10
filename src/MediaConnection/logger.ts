/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* This is a temporary logger until we start using some proper one */

/**
 * @param args - arguments
 */
export const debug = (...args: any[]): void => console.debug(...args);
/**
 * @param args - arguments
 */
export const error = (...args: any[]): void => console.error(...args);
/**
 * @param args - arguments
 */
export const log = (...args: any[]): void => console.log(...args);
/**
 * @param args - arguments
 */
export const warn = (...args: any[]): void => console.warn(...args);
