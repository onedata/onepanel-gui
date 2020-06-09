import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { Promise } from 'rsvp';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import SpaceItemImportStatsMixin from 'onepanel-gui/mixins/components/space-item-import-stats';
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

describe('Integration | Mixin | components/space item import stats', function () {
  setupTest('mixin:components/space-item-import-stats', {
    integration: true,
    subject(objectContent = {}) {
      let SpaceItemImportStats = EmberObject.extend(
        SpaceItemImportStatsMixin,
        objectContent
      );
      this.register(
        'test-container:space-item-import-stats-object',
        SpaceItemImportStats
      );
      return getOwner(this).lookup('test-container:space-item-import-stats-object');
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
      const importStats = {
        importStatus: 'done',
      };
      this.spaceManagerResolve('getImportStatusOnly', importStats);
      let subject = this.subject({
        space: SPACE_ONLY_IMPORT,
      });

      subject.fetchStatusImportStats();

      wait().then(() => {
        expect(subject.get('statsFrozen')).to.be.false;
        done();
      });
    });

  it('statsFrozen is true after fetching all stats with import done', function (done) {
    const importStats = {
      importStatus: 'done',
      stats: FAKE_STATS_1,
    };
    this.spaceManagerResolve('getImportAllStats', importStats);
    let subject = this.subject({
      space: SPACE_ONLY_IMPORT,
    });

    subject.fetchAllImportStats();

    wait().then(() => {
      expect(subject.get('statsFrozen')).to.be.true;
      done();
    });
  });

  it('statsFrozen is false after fetching all stats with import inProgress',
    function (done) {
      const importStats = {
        importStatus: 'inProgress',
        stats: FAKE_STATS_1,
      };
      this.spaceManagerResolve('getImportAllStats', importStats);
      let subject = this.subject({
        space: SPACE_ONLY_IMPORT,
      });

      subject.fetchAllImportStats();

      wait().then(() => {
        expect(subject.get('statsFrozen')).to.be.false;
        done();
      });
    });

});
