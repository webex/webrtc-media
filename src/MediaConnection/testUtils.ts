import {setImmediate} from 'timers';

export interface IControlledPromise<T> extends Promise<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export const createControlledPromise = (): IControlledPromise<unknown> => {
  let resolvePromise;
  let rejectPromise;

  const promise = new Promise((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  }) as IControlledPromise<unknown>;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.resolve = resolvePromise;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  promise.reject = rejectPromise;

  return promise;
};

export const flushPromises = () => new Promise(setImmediate);
