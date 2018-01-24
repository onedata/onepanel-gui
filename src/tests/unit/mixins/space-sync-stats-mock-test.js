import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import SpaceSyncStatsMockMixin from 'ember-onedata-onepanel-server/mixins/space-sync-stats-mock';

describe('Unit | Mixin | space sync stats mock', function () {
  it('generates mock stats on init', function () {
    let SpaceSyncStatsMockObject = EmberObject.extend(SpaceSyncStatsMockMixin);
    let subject = SpaceSyncStatsMockObject.create();

    let allStats = subject.get('allStats');

    expect(allStats).to.have.property('hour');
    expect(allStats.hour).to.have.property('insertCount');
    expect(allStats.hour.insertCount).to.have.length(12);
  });
});
