import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import { registerService } from '../../helpers/stub-service';

import onepanelServerStub from '../../helpers/onepanel-server-stub';

const CephManagerStub = Service;

describe('Unit | Service | cluster manager', function () {
  setupTest('service:cluster-manager', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  beforeEach(function () {
    registerService(this, 'onepanel-server', onepanelServerStub);
    registerService(this, 'ceph-manager', CephManagerStub);
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

    expect(clusterHostsInfo).to.have.length(2);
    expect(clusterHostsInfo[0].get('hostname'))
      .to.be.equal('node1.example.com');
    expect(clusterHostsInfo[0].get('database'))
      .to.be.equal(true);
    expect(clusterHostsInfo[0].get('clusterManager'))
      .to.be.equal(true);
    expect(clusterHostsInfo[0].get('clusterWorker'))
      .to.be.equal(false);

    expect(clusterHostsInfo[1].get('hostname'))
      .to.be.equal('node2.example.com');
    expect(clusterHostsInfo[1].get('database'))
      .to.be.equal(false);
    expect(clusterHostsInfo[1].get('clusterManager'))
      .to.be.equal(true);
    expect(clusterHostsInfo[1].get('clusterWorker'))
      .to.be.equal(true);

    expect(mainManagerHostname).to.be.equal('node2.example.com');
  });
});
