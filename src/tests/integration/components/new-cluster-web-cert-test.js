import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import I18nStub from '../../helpers/i18n-stub';
import { registerService, lookupService } from '../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import Service from '@ember/service';
import { click } from 'ember-native-dom-helpers';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import { resolve } from 'rsvp';
import { set } from '@ember/object';

const PROVIDER_DETAILS = {
  id: 'provider_id',
  name: 'Some provider',
  onezoneDomainName: 'example.com',
  subdomainDelegation: true,
  letsEncryptEnabled: undefined,
  subdomain: 'somedomain',
  domain: 'somedomain.onezone.org',
  geoLatitude: 49.698284,
  geoLongitude: 21.898093,
};

const GuiUtils = Service.extend({
  updateGuiNameProxy: () => resolve(),
});

const DeploymentManager = Service.extend({
  getClusterConfiguration() {
    return Promise.resolve({
      data: {
        onezone: {
          domainName: 'example.com',
        },
      },
    });
  },
  getHostNames: notImplementedThrow,
});

const WebCertManager = Service.extend({
  fetchWebCert() {
    return Promise.resolve({
      letsEncrypt: false,
    });
  },
  modifyWebCert() {
    return Promise.resolve();
  },
});

const OnepanelServer = Service.extend({
  serviceType: 'onezone',
  fetchConfiguration: notImplementedThrow,
  requestValidData: notImplementedThrow,
});

describe('Integration | Component | new cluster web cert', function () {
  setupComponentTest('new-cluster-web-cert', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'web-cert-manager', WebCertManager);
    registerService(this, 'deployment-manager', DeploymentManager);
    registerService(this, 'onepanel-server', OnepanelServer);
    registerService(this, 'gui-utils', GuiUtils);
    this.setProperties({
      _location: { reload: sinon.spy() },
      fakeClock: sinon.useFakeTimers({
        now: Date.now(),
        shouldAdvanceTime: true,
      }),
    });
  });

  afterEach(function () {
    this.get('fakeClock').restore();
  });

  it(
    'reloads page on next step if LetsEncrypt is enabled',
    function () {
      const providerDetails = Object.assign({}, PROVIDER_DETAILS, {
        subdomainDelegation: true,
      });
      this.set('providerDetailsProxy', PromiseObject.create({
        promise: Promise.resolve(providerDetails),
      }));
      const nextStep = sinon.spy();
      this.on('nextStep', nextStep);
      set(lookupService(this, 'guiUtils'), 'serviceType', 'onezone');

      this.render(hbs `{{new-cluster-web-cert
        _location=_location
        nextStep=(action "nextStep")
      }}`);

      return wait().then(() => {
        return click('.btn-cert-next').then(() => {
          this.get('fakeClock').tick(6000);
          return wait().then(() => {
            expect(this.get('_location.reload'), 'reload').to.be.called;
            expect(nextStep).to.be.not.called;
          });
        });
      });
    }
  );

  it(
    'does not reload page if LetsEncrypt is disabled',
    function () {
      const providerDetails = Object.assign({}, PROVIDER_DETAILS, {
        subdomainDelegation: true,
      });
      this.set('providerDetailsProxy', PromiseObject.create({
        promise: Promise.resolve(providerDetails),
      }));
      const nextStep = sinon.spy();
      this.on('nextStep', nextStep);

      this.render(hbs `{{new-cluster-web-cert
        _location=_location
        nextStep=(action "nextStep")
      }}`);

      return wait().then(() => {
        return click('.toggle-field-letsEncrypt').then(() => {
          return click('.btn-cert-next').then(() => {
            this.get('fakeClock').tick(6000);
            return wait().then(() => {
              expect(this.get('_location.reload'), 'reload').to.be.not.called;
              expect(nextStep, 'nextStep').to.be.called;
            });
          });
        });
      });
    }
  );
});
