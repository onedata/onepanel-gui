import { expect } from 'chai';
import { describe, it } from 'mocha';
import dynamicRound from 'onepanel-gui/utils/dynamic-round';

describe('Unit | Utility | dynamic round', function () {
  it('rounds numbers after point', function () {
    let result = dynamicRound(0.123456, 3);
    expect(result).to.equal('0.123');
  });
  it('returns "< 0.001" if number is too low', function () {
    let result = dynamicRound(0.00007251, 3);
    expect(result).to.equal('< 0.001');
  });
});
