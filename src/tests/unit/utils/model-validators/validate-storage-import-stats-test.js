import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateStorageImportStats from 'onepanel-gui/utils/model-validators/validate-storage-import-stats';

describe('Unit | Utility | model validators/validate space import stats', function () {
  it('detects lack of stats', function () {
    const importStats = {
      status: 'none',
    };
    let result = validateStorageImportStats(importStats);
    expect(result).to.be.false;
  });

  it('detects invalid type of stats', function () {
    const importStats = {
      status: 'none',
      stats: 'bad',
    };
    let result = validateStorageImportStats(importStats);
    expect(result).to.be.false;
  });

  it('positively validates valid stats', function () {
    const importStats = {
      status: 'none',
      stats: {},
    };
    let result = validateStorageImportStats(importStats);
    expect(result).to.be.true;
  });
});
