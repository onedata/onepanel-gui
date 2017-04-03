import { expect } from 'chai';
import { describe, it } from 'mocha';
import stripObject from 'onepanel-gui/utils/strip-object';

describe('Unit | Utility | strip object', function () {
  // Replace this with your real tests.
  it('creates new object', function () {
    let obj = {};
    let result = stripObject(obj);
    expect(result).to.be.not.null;
    expect(result).to.not.be.equal(obj);
  });
  it('removes keys with undefined or null values', function () {
    let obj = {
      one: 1,
      two: 'two2',
      three: undefined,
      four: null,
    };
    let result = stripObject(obj);
    expect(result).to.have.property('one');
    expect(result).to.have.property('two');
    expect(result).to.not.have.property('three');
    expect(result).to.not.have.property('four');
  });
});
