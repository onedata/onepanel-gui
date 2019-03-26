import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject from '@ember/object';
import DomainNameProxyMixin from 'onepanel-gui/mixins/domain-name-proxy';
import sinon from 'sinon';

describe('Unit | Mixin | domain name proxy', function () {

  it('uses deployment manager to resolve onezone domain name', function () {
    const DomainNameProxyObject = EmberObject.extend(DomainNameProxyMixin);
    const deploymentManager = {
      getInstallationDetailsProxy() {},
    };
    const domainName = 'zone.domain.name.com';
    const cluster = {
      clusterInfo: {
        onezone: {
          domainName,
        },
      },
    };
    const getInstallationDetailsProxy = sinon.stub(
      deploymentManager,
      'getInstallationDetailsProxy'
    );
    getInstallationDetailsProxy.resolves(cluster);

    const subject = DomainNameProxyObject.create({
      onepanelServiceType: 'onezone',
      deploymentManager,
    });

    return subject.getDomainProxy().then(domain => {
      expect(domain).to.equal(domainName);
    });
  });

  it('uses provider manager to resolve provider domain name', function () {
    const DomainNameProxyObject = EmberObject.extend(DomainNameProxyMixin);
    const providerManager = {
      getProviderDetailsProxy() {},
    };
    const domainName = 'provider.domain.name.com';
    const provider = {
      domain: domainName,
    };
    const getProviderDetailsProxy = sinon.stub(
      providerManager,
      'getProviderDetailsProxy'
    );
    getProviderDetailsProxy.resolves(provider);

    const subject = DomainNameProxyObject.create({
      onepanelServiceType: 'oneprovider',
      providerManager,
    });

    return subject.getDomainProxy().then(domain => {
      expect(domain).to.equal(domainName);
    });
  });
});
