import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import OnepanelServer from 'onepanel-gui/services/onepanel-server';

describe('Integration | Component | cluster dns check table', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.owner.register('service:onepanel-server', OnepanelServer);
    this.onepanelServer = this.owner.lookup('service:onepanel-server');
  });

  it('renders table with 2 items for zone', async function () {
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

    await render(hbs `{{cluster-dns-check-table
      onepanelServiceType="onezone"
      checkResultItems=checkResultItems
    }}`);

    const clusterDnsCheckTable = find('.cluster-dns-check-table');

    expect(clusterDnsCheckTable).to.exist;
    expect(clusterDnsCheckTable.querySelectorAll('.check-item')).to.have.length(2);
  });
});
