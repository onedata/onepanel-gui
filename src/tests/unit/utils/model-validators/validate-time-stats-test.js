import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateTimeStats from 'onepanel-gui/utils/model-validators/validate-time-stats';

describe('Unit | Utility | model-validators/validate-time-stats', function () {
  it('returns false if some required field of timeStats is missing', function () {
    const result = validateTimeStats({
      name: 'one',
      lastValueDate: undefined,
      values: undefined,
    });
    expect(result).to.be.false;
  });

  it('returns true if all required fields of timeStats are present', function () {
    const result = validateTimeStats({
      name: 'one',
      lastValueDate: new Date().toJSON(),
      values: [1, 2, 3],
    });
    expect(result).to.be.true;
  });
});
