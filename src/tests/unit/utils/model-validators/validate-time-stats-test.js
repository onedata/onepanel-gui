import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateTimeStats from 'onepanel-gui/utils/model-validators/validate-time-stats';

describe('Unit | Utility | model validators/validate time stats', function () {
  it('returns false if some required field of timeStats is missing', function () {
    let result = validateTimeStats({
      name: 'jeden',
      lastValueDate: undefined,
      values: undefined,
    });
    expect(result).to.be.false;
  });

  it('returns true if all required fields of timeStats are present', function () {
    let result = validateTimeStats({
      name: 'jeden',
      lastValueDate: new Date().toJSON(),
      values: [1, 2, 3],
    });
    expect(result).to.be.true;
  });
});
