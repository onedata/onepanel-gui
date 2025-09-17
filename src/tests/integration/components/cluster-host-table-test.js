import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import ClusterHostInfo from 'onepanel-gui/models/cluster-host-info';
import ToggleHelper from '../../helpers/toggle';

class HostTableHelper {
  constructor(hostTable) {
    this.hostTable = hostTable;
  }

  getRow(hostname) {
    return this.hostTable.querySelector(`tr[data-hostname="${hostname}"]`);
  }

  getToggle(hostname, option) {
    return this.getRow(hostname)
      .querySelector(`.one-way-toggle[data-option="${option}"]`);
  }
}

describe('Integration | Component | cluster-host-table', function () {
  setupRenderingTest();

  it('renders table with host rows', async function () {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'host.one.com',
      }),
      ClusterHostInfo.create({
        hostname: 'host.second.com',
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs `<ClusterHostTable @hosts={{hosts}} />`);

    const hostTable = find('.cluster-host-table');
    const helper = new HostTableHelper(hostTable);
    expect(hostTable).to.exist;
    expect(helper.getRow('host.one.com')).to.exist;
    expect(helper.getRow('host.second.com')).to.exist;
  });

  it('renders checked toggle for enabled services', async function () {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'host.one.com',
        database: true,
        clusterManager: false,
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs `<ClusterHostTable @hosts={{hosts}} />`);

    const hostTable = find('.cluster-host-table');
    const helper = new HostTableHelper(hostTable);

    const databaseToggle = helper.getToggle('host.one.com', 'database');
    expect(databaseToggle, 'database toggle').to.exist;
    expect(new ToggleHelper(databaseToggle).isChecked()).to.be.true;

    const clusterManagerToggle = helper.getToggle('host.one.com', 'clusterManager');
    expect(clusterManagerToggle, 'cluster manager toggle').to.exist;
    expect(new ToggleHelper(clusterManagerToggle).isChecked()).to.be.false;
  });

  // FIXME: refactor: remove redundancy in 3 disabled locks tests

  it('in edit mode has locked toggles excluding disabled S3 services without clusterWorker', async function () {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'one.example.com',
        database: true,
        clusterWorker: false,
        clusterManager: false,
        oneS3: false,
      }),
      ClusterHostInfo.create({
        hostname: 'two.example.com',
        database: true,
        clusterWorker: true,
        clusterManager: true,
        oneS3: true,
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs`<ClusterHostTable
      @hosts={{this.hosts}}
      @primaryClusterManager="one.example.com"
      @mode="edit"
    />`);

    const hostTable = find('.cluster-host-table');
    const helper = new HostTableHelper(hostTable);

    const expectedDisabled = {
      one: {
        database: true,
        clusterWorker: true,
        clusterManager: true,
        primaryClusterManager: true,
        oneS3: false,
      },
      two: {
        database: true,
        clusterWorker: true,
        clusterManager: true,
        primaryClusterManager: true,
        oneS3: true,
      },
    };

    for (const hostPrefix of ['one', 'two']) {
      for (const [service, state] of Object.entries(expectedDisabled[hostPrefix])) {
        const toggle = helper.getToggle(`${hostPrefix}.example.com`, service);
        const toggleHelper = new ToggleHelper(toggle);
        expect(toggleHelper.isDisabled(), `${hostPrefix}, ${service}`).to.equal(state);
      }
    }
  });

  it('in create mode has unlocked all toggles', async function () {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'one.example.com',
        database: true,
        clusterWorker: true,
        clusterManager: true,
        oneS3: false,
      }),
      ClusterHostInfo.create({
        hostname: 'two.example.com',
        database: false,
        clusterWorker: false,
        clusterManager: false,
        oneS3: true,
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs`<ClusterHostTable
      @hosts={{this.hosts}}
      @primaryClusterManager="one.example.com"
      @mode="create"
    />`);

    const hostTable = find('.cluster-host-table');
    const helper = new HostTableHelper(hostTable);

    const expectedDisabled = {
      one: {
        database: false,
        clusterWorker: false,
        clusterManager: false,
        primaryClusterManager: false,
        oneS3: false,
      },
      two: {
        database: false,
        clusterWorker: false,
        clusterManager: false,
        primaryClusterManager: false,
        oneS3: false,
      },
    };

    for (const hostPrefix of ['one', 'two']) {
      for (const [service, state] of Object.entries(expectedDisabled[hostPrefix])) {
        const toggle = helper.getToggle(`${hostPrefix}.example.com`, service);
        const toggleHelper = new ToggleHelper(toggle);
        expect(toggleHelper.isDisabled(), `${hostPrefix}, ${service}`).to.equal(state);
      }
    }
  });

  it('in show mode has locked all toggles', async function () {
    const hosts = [
      ClusterHostInfo.create({
        hostname: 'one.example.com',
        database: true,
        clusterWorker: true,
        clusterManager: true,
        oneS3: false,
      }),
      ClusterHostInfo.create({
        hostname: 'two.example.com',
        database: false,
        clusterWorker: false,
        clusterManager: false,
        oneS3: true,
      }),
    ];
    this.set('hosts', hosts);

    await render(hbs`<ClusterHostTable
      @hosts={{this.hosts}}
      @primaryClusterManager="one.example.com"
      @mode="show"
    />`);

    const hostTable = find('.cluster-host-table');
    const helper = new HostTableHelper(hostTable);

    const expectedDisabled = {
      one: {
        database: true,
        clusterWorker: true,
        clusterManager: true,
        primaryClusterManager: true,
        oneS3: true,
      },
      two: {
        database: true,
        clusterWorker: true,
        clusterManager: true,
        primaryClusterManager: true,
        oneS3: true,
      },
    };

    for (const hostPrefix of ['one', 'two']) {
      for (const [service, state] of Object.entries(expectedDisabled[hostPrefix])) {
        const toggle = helper.getToggle(`${hostPrefix}.example.com`, service);
        const toggleHelper = new ToggleHelper(toggle);
        expect(toggleHelper.isDisabled(), `${hostPrefix}, ${service}`).to.equal(state);
      }
    }
  });
});
