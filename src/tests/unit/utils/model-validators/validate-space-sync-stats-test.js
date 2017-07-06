import { expect } from 'chai';
import { describe, it } from 'mocha';
import validateSpaceSyncStats from 'onepanel-gui/utils/model-validators/validate-space-sync-stats';

describe('Unit | Utility | model validators/validate space sync stats', function () {
  it('detects lack of stats', function () {
    const syncStats = {
      updateStatus: 'none',
      importStatus: 'none',
    };
    let result = validateSpaceSyncStats(syncStats);
    expect(result).to.be.false;
  });

  it('detects invalid type of stats', function () {
    const syncStats = {
      updateStatus: 'none',
      importStatus: 'none',
      stats: 'bad',
    };
    let result = validateSpaceSyncStats(syncStats);
    expect(result).to.be.false;
  });

  it('positively validates valid stats', function () {
    const syncStats = {
      updateStatus: 'none',
      importStatus: 'none',
      stats: {},
    };
    let result = validateSpaceSyncStats(syncStats);
    expect(result).to.be.true;
  });
});
