import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { Promise } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import SpaceItemSyncStatsMixin from 'onepanel-gui/mixins/components/space-item-sync-stats';
import SpaceManagerStub from '../../helpers/space-manager-stub';
import wait from 'ember-test-helpers/wait';

const FAKE_STATS_1 = [{
  name: 'something',
  lastValueDate: new Date().toJSON(),
  period: 'minute',
  values: [1],
}];

const SPACE_ONLY_IMPORT = EmberObject.create({
  importEnabled: true,
  updateEnabled: false,
});

describe('Integration | Mixin | components/space item sync stats', function () {
  setupTest('mixin:components/space-item-sync-stats', {
    integration: true,
    subject(objectContent = {}) {
      let SpaceItemSyncStats = EmberObject.extend(
        SpaceItemSyncStatsMixin,
        objectContent
      );
      this.register(
        'test-container:space-item-sync-stats-object',
        SpaceItemSyncStats
      );
      return getOwner(this).lookup('test-container:space-item-sync-stats-object');
    },
  });

  beforeEach(function () {
    this.spaceManagerResolve = function (method, resolvedValue) {
      let spaceManager = getOwner(this).lookup('service:space-manager');
      spaceManager[method] = () =>
        new Promise(resolve => resolve(resolvedValue));
    };

    this.register('service:space-manager', SpaceManagerStub);
    this.inject.service('space-manager', {
      as: 'spaceManager',
    });
  });

  it('statsFrozen is false after fetching only statuses with import done',
    function (done) {
      const syncStats = {
        importStatus: 'done',
      };
      this.spaceManagerResolve('getSyncStatusOnly', syncStats);
      let subject = this.subject({
        space: SPACE_ONLY_IMPORT,
      });

      subject.fetchStatusSyncStats();

      wait().then(() => {
        expect(subject.get('statsFrozen')).to.be.false;
        done();
      });
    });

  it('statsFrozen is true after fetching all stats with import done', function (done) {
    const syncStats = {
      importStatus: 'done',
      stats: FAKE_STATS_1,
    };
    this.spaceManagerResolve('getSyncAllStats', syncStats);
    let subject = this.subject({
      space: SPACE_ONLY_IMPORT,
    });

    subject.fetchAllSyncStats();

    wait().then(() => {
      expect(subject.get('statsFrozen')).to.be.true;
      done();
    });
  });

  it('statsFrozen is false after fetching all stats with import inProgress',
    function (done) {
      const syncStats = {
        importStatus: 'inProgress',
        stats: FAKE_STATS_1,
      };
      this.spaceManagerResolve('getSyncAllStats', syncStats);
      let subject = this.subject({
        space: SPACE_ONLY_IMPORT,
      });

      subject.fetchAllSyncStats();

      wait().then(() => {
        expect(subject.get('statsFrozen')).to.be.false;
        done();
      });
    });

});
