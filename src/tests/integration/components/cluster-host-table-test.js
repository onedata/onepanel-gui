import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

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
  setupComponentTest('cluster-host-table', {
    integration: true
  });

  it('renders table with host rows', function () {
    let hosts = [
      ClusterHostInfo.create({
        hostname: 'host.one.com',
      }),
      ClusterHostInfo.create({
        hostname: 'host.second.com',
      })
    ];
    this.set('hosts', hosts);

    this.render(hbs`{{cluster-host-table hosts=hosts}}`);

    let $hostTable = $('.cluster-host-table');
    let helper = new HostTableHelper($hostTable);
    expect($hostTable).to.exist;
    expect(helper.getRow('host.one.com')).to.exist;
    expect(helper.getRow('host.second.com')).to.exist;
  });

  it('renders checked toggle for enabled services', function () {
    let hosts = [
      ClusterHostInfo.create({
        hostname: 'host.one.com',
        database: true,
        clusterManager: false,
      })
    ];
    this.set('hosts', hosts);

    this.render(hbs`{{cluster-host-table hosts=hosts}}`);

    let $hostTable = $('.cluster-host-table');
    let helper = new HostTableHelper($hostTable);

    let $databaseToggle = helper.getToggle('host.one.com', 'database');
    expect($databaseToggle, 'database toggle').to.exist;
    expect(new ToggleHelper($databaseToggle).isChecked()).to.be.true;

    let $clusterManagerToggle = helper.getToggle('host.one.com', 'clusterManager');
    expect($clusterManagerToggle, 'database toggle').to.exist;
    expect(new ToggleHelper($clusterManagerToggle).isChecked()).to.be.false;
  });
});
