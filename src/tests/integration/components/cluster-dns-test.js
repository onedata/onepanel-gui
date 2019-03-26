import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, reject } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import Service from '@ember/service';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const ProviderManager = Service.extend({
  getProviderDetailsProxy() {},
});

const OnepanelServer = Service.extend({
  request() {},
});

const GuiUtils = Service.extend({
  fetchGuiVersion: notImplementedReject,
});

describe('Integration | Component | cluster dns', function () {
  setupComponentTest('cluster-dns', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'providerManager', ProviderManager);
    registerService(this, 'deploymentManager', Service);
    registerService(this, 'onepanelServer', OnepanelServer);
    registerService(this, 'guiUtils', GuiUtils);

    sinon.stub(lookupService(this, 'guiUtils'), 'fetchGuiVersion')
      .resolves('18.03.1');
  });

  it('renders DNS server IPs fetched from server', function () {
    const dnsCheck = {
      domain: {
        summary: 'ok',
        expected: ['149.156.11.33'],
        got: ['149.156.11.33'],
      },
    };
    this.set('dnsCheckProxy', PromiseObject.create({ promise: resolve(dnsCheck) }));
    this.set('zonePoliciesProxy', PromiseObject.create({
      promise: reject(),
    }));
    sinon.stub(lookupService(this, 'providerManager'), 'getProviderDetailsProxy')
      .resolves({
        domain: 'hello.domain',
        subdomainDelegation: false,
      });

    sinon.stub(lookupService(this, 'onepanelServer'), 'request')
      .withArgs('onepanel', 'getDnsCheckConfiguration')
      .resolves({
        data: {
          dnsServers: ['8.8.8.8', '192.168.0.1'],
          builtInDnsServer: true,
        },
      });

    this.render(hbs `{{cluster-dns
      onepanelServiceType="oneprovider"
      dnsCheckProxy=dnsCheckProxy
      zonePoliciesProxy=zonePoliciesProxy
    }}`);

    const $clusterDns = this.$('.cluster-dns');
    return wait().then(() => {
      expect($clusterDns).to.exist;
      expect($clusterDns).to.contain('8.8.8.8');
      expect($clusterDns).to.contain('192.168.0.1');
    });
  });
});
