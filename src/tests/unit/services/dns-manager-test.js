import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import Service from '@ember/service';
import wait from 'ember-test-helpers/wait';

const OnepanelServer = Service.extend({
  request() {},
});

describe('Unit | Service | dns manager', function () {
  setupTest();

  beforeEach(function beforeEach() {
    registerService(this, 'onepanelServer', OnepanelServer);
  });

  it('computes dnsValid to true', function () {
    const checkDnsData = {
      domain: {
        summary: 'ok',
      },
    };
    const onepanelServer = lookupService(this, 'onepanelServer');
    sinon.stub(onepanelServer, 'request')
      .withArgs('DNSApi', 'checkDns')
      .resolves({ data: checkDnsData });

    const service = this.owner.lookup('service:dns-manager');
    service.getDnsCheckProxy();

    return wait().then(() => {
      expect(service.get('dnsValid')).to.be.true;
    });
  });

  it('computes dnsValid to false', function () {
    const checkDnsData = {
      domain: {
        summary: 'bad_records',
      },
    };
    const onepanelServer = lookupService(this, 'onepanelServer');
    sinon.stub(onepanelServer, 'request')
      .withArgs('DNSApi', 'checkDns')
      .resolves({ data: checkDnsData });

    const service = this.owner.lookup('service:dns-manager');
    service.getDnsCheckProxy();

    return wait().then(() => {
      expect(service.get('dnsValid')).to.be.false;
    });
  });
});
