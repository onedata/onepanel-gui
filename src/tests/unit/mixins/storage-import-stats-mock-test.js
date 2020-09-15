import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import StorageImportStatsMockMixin from 'ember-onedata-onepanel-server/mixins/storage-import-stats-mock';

describe('Unit | Mixin | storage import stats mock', function () {
  it('generates mock stats on init', function () {
    let StorageImportStatsMockObject = EmberObject.extend(StorageImportStatsMockMixin);
    let subject = StorageImportStatsMockObject.create();

    let allStats = subject.get('allStats');

    expect(allStats).to.have.property('hour');
    expect(allStats.hour).to.have.property('createdFiles');
    expect(allStats.hour.createdFiles).to.have.length(12);
  });
});
