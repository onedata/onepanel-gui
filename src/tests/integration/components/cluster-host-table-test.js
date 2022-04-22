import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import $ from 'jquery';

import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import ToggleHelper from '../../helpers/toggle';

class HostTableHelper {
  constructor($hostTable) {
    this.$hostTable = $hostTable;
  }

  getRow(hostname) {
    return this.$hostTable.find(`tr[data-hostname="${hostname}"]`);
  }

  getToggle(hostname, option) {
    return this.getRow(hostname).find(`.one-way-toggle[data-option="${option}"]`);
  }
}

describe('Integration | Component | cluster host table', function () {
  setupRenderingTest();

  it('renders table with host rows', async function() {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'host.one.com',
      }),
      ClusterHostInfo.create({
        hostname: 'host.second.com',
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs `{{cluster-host-table hosts=hosts}}`);

    const $hostTable = $('.cluster-host-table');
    const helper = new HostTableHelper($hostTable);
    expect($hostTable).to.exist;
    expect(helper.getRow('host.one.com')).to.exist;
    expect(helper.getRow('host.second.com')).to.exist;
  });

  it('renders checked toggle for enabled services', async function() {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'host.one.com',
        database: true,
        clusterManager: false,
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs `{{cluster-host-table hosts=hosts}}`);

    const $hostTable = $('.cluster-host-table');
    const helper = new HostTableHelper($hostTable);

    const $databaseToggle = helper.getToggle('host.one.com', 'database');
    expect($databaseToggle, 'database toggle').to.exist;
    expect(new ToggleHelper($databaseToggle).isChecked()).to.be.true;

    const $clusterManagerToggle = helper.getToggle('host.one.com', 'clusterManager');
    expect($clusterManagerToggle, 'cluster manager toggle').to.exist;
    expect(new ToggleHelper($clusterManagerToggle).isChecked()).to.be.false;
  });
});
