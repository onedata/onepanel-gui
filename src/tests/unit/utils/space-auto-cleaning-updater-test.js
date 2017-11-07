import { expect } from 'chai';
import { describe, it } from 'mocha';
import SpaceAutoCleaningUpdater from 'onepanel-gui/utils/space-auto-cleaning-updater';

import { A } from '@ember/array';

describe('Unit | Utility | space auto cleaning updater', function () {
  it('computes _lastReportMoment to include updates of last report in progress',
    function () {
      const spaceId = 'aaa';
      const fakeSpaceManager = {};
      const lastStoppedDate = '2017-10-26T12:10:00.000Z';
      const expectedDate = '2017-10-26T12:09:59.000Z';
      const reports = A([
        // in progress
        {
          startedAt: '2017-10-26T12:30:00.000Z',
        },
        {
          startedAt: '2017-10-26T12:00:00.000Z',
          stoppedAt: lastStoppedDate,
        },
      ]);
      const updater = SpaceAutoCleaningUpdater.create({
        spaceId,
        spaceManager: fakeSpaceManager,
        // force watchers off
        isEnabled: false,
      });
      updater.set('reports', reports);

      const _lastReportMoment = updater.get('_lastReportMoment');

      expect(_lastReportMoment.toISOString()).to.be.equal(expectedDate);
    });

  it('computes _lastReportMoment from start if there is one report in progress ',
    function () {
      const spaceId = 'aaa';
      const fakeSpaceManager = {};
      const startedAt = '2017-10-26T12:10:00.000Z';
      const expectedDate = '2017-10-26T12:09:59.000Z';
      const reports = A([
        // in progress
        {
          startedAt,
        },
      ]);
      const updater = SpaceAutoCleaningUpdater.create({
        spaceId,
        spaceManager: fakeSpaceManager,
        // force watchers off
        isEnabled: false,
      });
      updater.set('reports', reports);

      const _lastReportMoment = updater.get('_lastReportMoment');

      expect(_lastReportMoment.toISOString()).to.be.equal(expectedDate);
    });

  it('computes _lastReportMoment from stop if there is one report finished',
    function () {
      const spaceId = 'aaa';
      const fakeSpaceManager = {};
      const startedAt = '2017-10-26T12:10:00.000Z';
      const stoppedAt = '2017-10-26T12:20:00.000Z';
      const expectedDate = '2017-10-26T12:19:59.000Z';
      const reports = A([
        // in progress
        {
          startedAt,
          stoppedAt,
        },
      ]);
      const updater = SpaceAutoCleaningUpdater.create({
        spaceId,
        spaceManager: fakeSpaceManager,
        // force watchers off
        isEnabled: false,
      });
      updater.set('reports', reports);

      const _lastReportMoment = updater.get('_lastReportMoment');

      expect(_lastReportMoment.toISOString()).to.be.equal(expectedDate);
    });
});
