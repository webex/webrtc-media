/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  namespace jest {
    interface Matchers {
      toBeCalledOnceWith(received?: any, ...expected: any[]): CustomMatcherResult;
    }
  }
}
