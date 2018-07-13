import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { Promise } from 'rsvp';
import I18nStub from '../../helpers/i18n-stub';
import { registerService } from '../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import Service from '@ember/service';
import { click } from 'ember-native-dom-helpers';

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

const ClusterManager = Service.extend({
  getConfiguration() {
    return Promise.resolve({
      data: {
        onezone: {
          domainName: 'example.com',
        },
      },
    });
  },
});

const WebCertManager = Service.extend({
  getWebCert() {
    return Promise.resolve({
      letsEncrypt: false,
    });
  },
  modifyWebCert() {
    return Promise.resolve();
  },
});

const OnepanelServer = Service.extend({
  serviceType: 'zone',
});

describe('Integration | Component | new cluster provider cert', function () {
  setupComponentTest('new-cluster-web-cert', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'web-cert-manager', WebCertManager);
    registerService(this, 'cluster-manager', ClusterManager);
    registerService(this, 'onepanel-server', OnepanelServer);
    this.set('_location', {});
  });

  it(
    'changes the domain on next step if LetsEncrypt are enabled',
    function () {
      const providerDetails = Object.assign({}, PROVIDER_DETAILS, {
        subdomainDelegation: true,
      });
      this.set('providerDetailsProxy', PromiseObject.create({
        promise: Promise.resolve(providerDetails),
      }));
      const changeDomain = sinon.stub();
      changeDomain.resolves(undefined);
      this.on('changeDomain', changeDomain);
      const nextStep = sinon.spy();
      this.on('nextStep', nextStep);

      this.render(hbs `{{new-cluster-web-cert
        _changeDomain=(action "changeDomain")
        _location=_location
        nextStep=(action "nextStep")
      }}`);

      return wait().then(() => {
        return click('.btn-cert-next').then(() => {
          expect(changeDomain).to.be.called;
          expect(nextStep).to.be.not.called;
        });
      });
    }
  );

  it(
    'does not change the domain if LetsEncrypt is disabled',
    function () {
      const providerDetails = Object.assign({}, PROVIDER_DETAILS, {
        subdomainDelegation: true,
      });
      this.set('providerDetailsProxy', PromiseObject.create({
        promise: Promise.resolve(providerDetails),
      }));
      const changeDomain = sinon.spy();
      this.on('changeDomain', changeDomain);
      const nextStep = sinon.spy();
      this.on('nextStep', nextStep);

      this.render(hbs `{{new-cluster-web-cert
        _changeDomain=(action "changeDomain")
        _location=_location
        nextStep=(action "nextStep")
      }}`);

      return wait().then(() => {
        return click('.toggle-field-letsEncrypt').then(() => {
          return click('.btn-cert-next').then(() => {
            expect(changeDomain, 'changeDomain').to.be.not.called;
            expect(nextStep, 'nextStep').to.be.called;
          });
        });
      });
    }
  );
});
