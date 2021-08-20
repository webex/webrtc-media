import {expect} from 'chai';

import {ExampleModule} from './index';

describe('ExampleModule', () => {
  it('say - outputs Hello World', () => {
    expect(ExampleModule.sayHello('World'))
      .equal('Hello World');
  });
  it('getAverage - returns average', () => {
    expect(ExampleModule.getAverage(5, 10))
      .equal(7.5);
  });
});
