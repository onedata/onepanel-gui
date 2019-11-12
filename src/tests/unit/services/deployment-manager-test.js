import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { get, set } from '@ember/object';
import { lookupService, registerService } from '../../helpers/stub-service';
import onepanelServerStub from '../../helpers/onepanel-server-stub';
import Service from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import sinon from 'sinon';

const ClusterModelManagerStub = Service.extend({
  getCurrentClusterProxy: notImplementedReject,
});

const GuiUtils = Service.extend({});

describe('Unit | Service | deployment manager', function () {
  setupTest('service:deployment-manager', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  beforeEach(function () {
    registerService(this, 'cephManager', Service);
    registerService(this, 'i18n', Service);
    registerService(this, 'onepanelServer', onepanelServerStub);
    registerService(this, 'clusterModelManager', ClusterModelManagerStub);
    registerService(this, 'guiUtils', GuiUtils);

    sinon.stub(
      lookupService(this, 'clusterModelManager'),
      'getCurrentClusterProxy'
    ).resolves({ id: 'current_cluster_id' });

    set(lookupService(this, 'guiUtils'), 'serviceType', 'onezone');
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
