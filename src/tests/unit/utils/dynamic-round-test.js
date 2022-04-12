import { expect } from 'chai';
import { describe, it } from 'mocha';
import dynamicRound from 'onedata-gui-common/utils/dynamic-round';

describe('Unit | Utility | dynamic round', function () {
  it('rounds numbers after point', function () {
    const result = dynamicRound(0.123456, 3);
    expect(result).to.equal('0.123');
  });
  it('returns "< 0.001" if number is too low', function () {
    const result = dynamicRound(0.00007251, 3);
    expect(result).to.equal('< 0.001');
  });
});
