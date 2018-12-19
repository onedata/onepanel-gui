import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';
import { resolve } from 'rsvp';

const OnepanelServer = Service.extend({
  serviceTypeProxy: undefined,
  getClusterIdFromUrl() {},
  getLocation() {},
});
const ProviderManager = Service.extend({
  getProviderDetails() {},
});

describe('Unit | Service | onezone gui', function () {
  setupTest('service:onezone-gui', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  beforeEach(function beforeEach() {
    registerService(this, 'onepanelServer', OnepanelServer);
    registerService(this, 'providerManager', ProviderManager);
  });

  it(
    'uses providerManager to resolve Onezone domain name on standalone Provider Onepanel',
    function () {
      const onepanelServer = lookupService(this, 'onepanelServer');
      onepanelServer.serviceTypeProxy = resolve('provider');
      sinon.stub(onepanelServer, 'getClusterIdFromUrl')
        .returns(null);
      const providerManager = lookupService(this, 'providerManager');
      sinon.stub(providerManager, 'getProviderDetails').resolves({
        onezoneDomainName: 'onedata.org',
      });

      const service = this.subject();

      return service.fetchOnezoneOrigin().then(result => {
        expect(result).to.equal('https://onedata.org');
      });
    });

  it(
    'uses location to resolve Onezone domain name on embedded Onepanel',
    function () {
      const onepanelServer = lookupService(this, 'onepanelServer');
      onepanelServer.serviceTypeProxy = resolve('provider');
      sinon.stub(onepanelServer, 'getClusterIdFromUrl')
        .returns('3943u42389478');

      const service = this.subject({
        _location: {
          origin: 'https://onezone.org',
          toString() {
            return 'https://onezone.org/opp/3943u42389478/i';
          },
        },
      });

      return service.fetchOnezoneOrigin().then(result => {
        expect(result).to.equal('https://onezone.org');
      });
    });
});
