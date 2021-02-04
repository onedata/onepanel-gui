import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { registerService, lookupService } from '../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import Service from '@ember/service';
import { click } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';
import { set } from '@ember/object';

const DeploymentManager = Service.extend({
  getClusterConfiguration() {
    return resolve({
      data: {
        onezone: {
          domainName: 'onezone.org',
        },
      },
    });
  },
});

const ProviderManager = Service.extend({
  getProviderDetailsProxy() {
    return promiseObject(resolve({
      domain: 'somedomain.onezone.org',
    }));
  },
});

const WebCertManager = Service.extend({
  fetchWebCert() {
    return resolve({
      letsEncrypt: false,
    });
  },
  modifyWebCert() {
    return resolve();
  },
});

const reloadDelay = 5000;

describe('Integration | Component | new cluster web cert', function () {
  setupComponentTest('new-cluster-web-cert', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'web-cert-manager', WebCertManager);
    registerService(this, 'deployment-manager', DeploymentManager);
    registerService(this, 'provider-manager', ProviderManager);
    registerService(this, 'gui-utils', Service);
    this.setProperties({
      _location: {
        reload: sinon.spy(),
        hostname: '127.0.0.1',
      },
      fakeClock: sinon.useFakeTimers({
        now: Date.now(),
        shouldAdvanceTime: true,
      }),
    });
  });

  afterEach(function () {
    this.get('fakeClock').restore();
  });

  [{
    serviceType: 'onezone',
    serviceDomain: 'onezone.org',
  }, {
    serviceType: 'oneprovider',
    serviceDomain: 'somedomain.onezone.org',
  }].forEach(({ serviceType, serviceDomain }) => {
    it(
      `redirects to ${serviceType} domain on next step if LetsEncrypt is enabled and GUI was served via IP address`,
      async function () {
        set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
        const _location = this.get('_location');
        _location.hostname = '127.0.0.1';
        const nextStep = this.set('nextStep', sinon.spy());
        this.render(hbs `{{new-cluster-web-cert _location=_location nextStep=nextStep}}`);

        await wait();
        await click('.btn-cert-next');
        this.get('fakeClock').tick(reloadDelay);
        await wait();

        expect(_location.hostname).to.equal(serviceDomain);
        expect(_location.reload).to.not.be.called;
        expect(nextStep).to.be.not.called;
      }
    );

    it(
      `reloads ${serviceType} GUI on next step if LetsEncrypt is enabled and GUI was served via service domain`,
      async function () {
        set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
        const _location = this.get('_location');
        _location.hostname = serviceDomain;
        const nextStep = this.set('nextStep', sinon.spy());
        this.render(hbs `{{new-cluster-web-cert _location=_location nextStep=nextStep}}`);

        await wait();
        await click('.btn-cert-next');
        this.get('fakeClock').tick(reloadDelay);
        await wait();

        expect(_location.hostname).to.equal(serviceDomain);
        expect(_location.reload).to.be.calledOnce;
        expect(nextStep).to.be.not.called;
      }
    );

    it(`does not reload ${serviceType} GUI on next step if LetsEncrypt is disabled`, async function () {
      set(lookupService(this, 'guiUtils'), 'serviceType', serviceType);
      const _location = this.get('_location');
      const oldHostname = _location.hostname;
      const nextStep = this.set('nextStep', sinon.spy());
      this.render(hbs `{{new-cluster-web-cert _location=_location nextStep=nextStep}}`);

      await wait();
      await click('.toggle-field-letsEncrypt');
      await click('.btn-cert-next');
      this.get('fakeClock').tick(reloadDelay);
      await wait();

      expect(_location.hostname).to.equal(oldHostname);
      expect(this.get('_location.reload')).to.be.not.called;
      expect(nextStep, 'nextStep').to.be.called;
    });
  });
});
