import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { get } from '@ember/object';

import onepanelServerStub from '../../helpers/onepanel-server-stub';

describe('Unit | Service | configuration manager', function () {
  setupTest('service:configuration-manager', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  beforeEach(function () {
    this.register('service:onepanel-server', onepanelServerStub);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });
  });

  it('converts API cluster info to array of ClusterHostInfo', function () {
    let service = this.subject();

    const CLUSTER = {
      databases: {
        hosts: ['node1.example.com'],
      },
      managers: {
        mainHost: 'node2.example.com',
        hosts: ['node1.example.com', 'node2.example.com'],
      },
      workers: {
        hosts: ['node2.example.com'],
      },
    };

    let {
      mainManagerHostname,
      clusterHostsInfo,
    } = service._clusterConfigurationToHostsInfo(CLUSTER);

    console.log(clusterHostsInfo);
    expect(clusterHostsInfo).to.have.length(2);
    expect(get(clusterHostsInfo[0], 'hostname'), '0 hostname')
      .to.be.equal('node1.example.com');
    expect(get(clusterHostsInfo[0], 'database'), '0 database')
      .to.be.equal(true);
    expect(get(clusterHostsInfo[0], 'clusterManager'), '0 clusterManager')
      .to.be.equal(true);
    expect(get(clusterHostsInfo[0], 'clusterWorker'), '0 clusterWorker')
      .to.be.equal(false);

    expect(get(clusterHostsInfo[1], 'hostname'))
      .to.be.equal('node2.example.com');
    expect(get(clusterHostsInfo[1], 'database'))
      .to.be.equal(false);
    expect(get(clusterHostsInfo[1], 'clusterManager'))
      .to.be.equal(true);
    expect(get(clusterHostsInfo[1], 'clusterWorker'))
      .to.be.equal(true);

    expect(mainManagerHostname).to.be.equal('node2.example.com');
  });
});
