import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import OnepanelServer from 'onepanel-gui/services/onepanel-server';

describe('Integration | Component | cluster dns check table', function () {
  setupComponentTest('cluster-dns-check-table', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:onepanel-server', OnepanelServer);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });
  });

  it('renders table with 2 items for zone', function () {
    this.set('checkResultItems', [{
      type: 'domain',
      summary: 'missing_records',
      expected: ['149.156.11.33', '149.156.11.34'],
      got: ['149.156.11.33'],
      recommended: [],
    }, {
      type: 'dnsZone',
      summary: 'bad_records',
      expected: ['10.11.12.13'],
      got: ['100.100.102.102'],
      recommended: [],
    }]);

    this.render(hbs `{{cluster-dns-check-table
      onepanelServiceType="zone"
      checkResultItems=checkResultItems
    }}`);

    const $clusterDnsCheckTable = this.$('.cluster-dns-check-table');

    expect($clusterDnsCheckTable).to.exist;
    expect($clusterDnsCheckTable.find('.check-item')).to.have.length(2);
  });
});
