import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import BatchResolver from 'onedata-gui-common/utils/batch-resolver';

const ProviderManager = Service.extend({
  getProviderDetailsProxy: notImplementedReject,
});

const SpaceManager = Service.extend({
  getSpacesBatchResolver: notImplementedReject,
});

const StorageManager = Service.extend({
  getStoragesIds: notImplementedReject,
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

describe('Integration | Component | content-clusters-overview', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'provider-manager', ProviderManager);
    registerService(this, 'space-manager', SpaceManager);
    registerService(this, 'storage-manager', StorageManager);
    this.emptyBatchResolver = BatchResolver.create({
      promiseFunctions: [],
    });
  });

  it('does not use providerManager if cluster is not Oneprovider', async function () {
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
    const getSpacesBatchResolver = sinon.stub(spaceManager, 'getSpacesBatchResolver')
      .resolves(this.emptyBatchResolver);
    const storageManager = lookupService(this, 'storage-manager');
    const getStoragesIds =
      sinon.stub(storageManager, 'getStoragesIds').resolves([]);
    this.setProperties({
      cluster,
      fetchInstallationDetails,
    });

    await render(hbs `{{content-clusters-overview
      cluster=cluster
      fetchInstallationDetails=fetchInstallationDetails
      fetchStorages=fetchStorages
      fetchSpaces=fetchSpaces
    }}`);

    expect(getProviderDetailsProxy).to.be.not.called;
    expect(getSpacesBatchResolver).to.be.not.called;
    expect(getStoragesIds).to.be.not.called;
  });

  it('uses providerManager if cluster is Oneprovider', async function () {
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
    const getSpacesBatchResolver = sinon.stub(spaceManager, 'getSpacesBatchResolver')
      .resolves(this.emptyBatchResolver);
    const storageManager = lookupService(this, 'storage-manager');
    const getStoragesIds =
      sinon.stub(storageManager, 'getStoragesIds').resolves([]);
    const fetchInstallationDetails = sinon.stub().resolves(installationDetails);
    this.setProperties({
      cluster,
      fetchInstallationDetails,
    });

    await render(hbs `{{content-clusters-overview
      cluster=cluster
      fetchInstallationDetails=fetchInstallationDetails
    }}`);

    expect(getProviderDetailsProxy).to.be.calledOnce;
    expect(getSpacesBatchResolver).to.be.calledOnce;
    expect(getStoragesIds).to.be.calledOnce;
  });
});
