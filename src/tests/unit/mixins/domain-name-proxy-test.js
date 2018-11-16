import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import DomainNameProxyMixin from 'onepanel-gui/mixins/domain-name-proxy';
import sinon from 'sinon';

describe('Unit | Mixin | domain name proxy', function () {

  it('uses cluster manager to resolve zone domain name', function () {
    const DomainNameProxyObject = EmberObject.extend(DomainNameProxyMixin);
    const clusterManager = {
      getDefaultRecord() {},
    };
    const domainName = 'zone.domain.name.com';
    const cluster = {
      clusterInfo: {
        onezone: {
          domainName,
        },
      },
    };
    const getDefaultRecord = sinon.stub(clusterManager, 'getDefaultRecord');
    getDefaultRecord.resolves(cluster);

    const subject = DomainNameProxyObject.create({
      onepanelServiceType: 'zone',
      clusterManager,
    });

    return subject.getDomainProxy().then(domain => {
      expect(domain).to.equal(domainName);
    });
  });

  it('uses provider manager to resolve provider domain name', function () {
    const DomainNameProxyObject = EmberObject.extend(DomainNameProxyMixin);
    const providerManager = {
      getProviderDetails() {},
    };
    const domainName = 'provider.domain.name.com';
    const provider = {
      domain: domainName,
    };
    const getProviderDetails = sinon.stub(providerManager, 'getProviderDetails');
    getProviderDetails.resolves(provider);

    const subject = DomainNameProxyObject.create({
      onepanelServiceType: 'provider',
      providerManager,
    });

    return subject.getDomainProxy().then(domain => {
      expect(domain).to.equal(domainName);
    });
  });
});
