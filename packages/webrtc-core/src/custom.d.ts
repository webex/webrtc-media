declare namespace jest {
  interface Matchers<R> {
    toBeCalledOnceWith(...args: unknown[]): R;
  }
}
