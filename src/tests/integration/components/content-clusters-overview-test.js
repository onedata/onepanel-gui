import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import wait from 'ember-test-helpers/wait';

const ProviderManager = Service.extend({
  getProviderDetailsProxy: notImplementedReject,
});

const SpaceManager = Service.extend({
  getSpaces: notImplementedReject,
});

const StorageManager = Service.extend({
  getStorages: notImplementedReject,
});

const noNodesInstallationDetails = {
  cluster: {
    databases: {
      hosts: [],
    },
    managers: {
      hosts: [],
    },
    workers: {
      hosts: [],
    },
  },
};

describe('Integration | Component | content clusters overview', function () {
  setupComponentTest('content-clusters-overview', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'provider-manager', ProviderManager);
    registerService(this, 'space-manager', SpaceManager);
    registerService(this, 'storage-manager', StorageManager);
  });

  it('does not use providerManager if cluster is not Oneprovider', function () {
    const cluster = {
      id: 'cid',
      name: 'cname',
      type: 'onezone',
    };
    const installationDetails = noNodesInstallationDetails;
    const providerManager = lookupService(this, 'provider-manager');
    const getProviderDetailsProxy =
      sinon.spy(providerManager, 'getProviderDetailsProxy');
    const fetchInstallationDetails = sinon.stub().resolves(installationDetails);
    const spaceManager = lookupService(this, 'space-manager');
    const getSpaces =
      sinon.stub(spaceManager, 'getSpaces').resolves([]);
    const storageManager = lookupService(this, 'storage-manager');
    const getStorages =
      sinon.stub(storageManager, 'getStorages').resolves([]);
    this.setProperties({
      cluster,
      fetchInstallationDetails,
    });

    this.render(hbs `{{content-clusters-overview
      cluster=cluster
      fetchInstallationDetails=fetchInstallationDetails
      fetchStorages=fetchStorages
      fetchSpaces=fetchSpaces
    }}`);

    return wait().then(() => {
      expect(getProviderDetailsProxy).to.be.not.called;
      expect(getSpaces).to.be.not.called;
      expect(getStorages).to.be.not.called;
    });
  });

  it('does uses providerManager if cluster is Oneprovider', function () {
    const cluster = {
      id: 'cid',
      name: 'cname',
      type: 'oneprovider',
    };
    const installationDetails = noNodesInstallationDetails;
    const providerManager = lookupService(this, 'provider-manager');
    const getProviderDetailsProxy =
      sinon.stub(providerManager, 'getProviderDetailsProxy').resolves({});
    const spaceManager = lookupService(this, 'space-manager');
    const getSpaces =
      sinon.stub(spaceManager, 'getSpaces').resolves([]);
    const storageManager = lookupService(this, 'storage-manager');
    const getStorages =
      sinon.stub(storageManager, 'getStorages').resolves([]);
    const fetchInstallationDetails = sinon.stub().resolves(installationDetails);
    this.setProperties({
      cluster,
      fetchInstallationDetails,
    });

    this.render(hbs `{{content-clusters-overview
      cluster=cluster
      fetchInstallationDetails=fetchInstallationDetails
    }}`);

    return wait().then(() => {
      expect(getProviderDetailsProxy).to.be.calledOnce;
      expect(getSpaces).to.be.calledOnce;
      expect(getStorages).to.be.calledOnce;
    });
  });
});
