import {expect} from 'chai';
import ExampleModule from './index';

describe('ExampleModule', () => {
  it('say - outputs Hello World', () => {
    expect(ExampleModule.sayHello('World')).to.eq('Hello World');
  });
  it('getAverage - returns average', () => {
    expect(ExampleModule.getAverage(5, 10)).to.eq(7.5);
  });
});
