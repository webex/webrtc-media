expect.extend({
  toBeCalledOnceWith(received, ...expected) {
    try {
      expect(received).toBeCalledTimes(1);
      expect(received).toBeCalledWith(...expected);
    } catch (error) {
      return {message: () => error, pass: false};
    }

    return {pass: true, message: () => `expected ${received} to be called once with ${expected}`};
  },
});
