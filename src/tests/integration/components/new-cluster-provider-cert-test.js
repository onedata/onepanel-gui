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

const ProviderManager = Service.extend({
  modifyProvider() {
    return Promise.resolve({});
  },
});

describe('Integration | Component | new cluster provider cert', function () {
  setupComponentTest('new-cluster-provider-cert', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'provider-manager', ProviderManager);
    this.set('_location', {});
  });

  it('renders information about disabled cert generation', function () {
    const providerDetails = Object.assign({}, PROVIDER_DETAILS, {
      subdomainDelegation: false,
    });
    this.set('providerDetailsProxy', PromiseObject.create({
      promise: Promise.resolve(providerDetails),
    }));

    this.render(hbs `{{new-cluster-provider-cert
      providerDetailsProxy=providerDetailsProxy
      _location=_location
    }}`);

    return wait().then(() => {
      expect(this.$('.text-subdomain'), 'subdomain text').to.not.exist;
      expect(this.$('.text-no-subdomain'), 'no-subdomain text').to.exist;
    });
  });

  it('does not change the domain on next step if subdomainDelegation is diabled',
    function () {
      const providerDetails = Object.assign({}, PROVIDER_DETAILS, {
        subdomainDelegation: false,
      });
      this.set('providerDetailsProxy', PromiseObject.create({
        promise: Promise.resolve(providerDetails),
      }));
      const changeDomain = sinon.spy();
      this.on('changeDomain', changeDomain);
      const nextStep = sinon.spy();
      this.on('nextStep', nextStep);

      this.render(hbs `{{new-cluster-provider-cert
        providerDetailsProxy=providerDetailsProxy
        _changeDomain=(action "changeDomain")
        _location=_location
        nextStep=(action "nextStep")
      }}`);

      return click('.btn-cert-next').then(() => {
        expect(changeDomain).to.be.not.called;
        expect(nextStep).to.be.called;
      });
    }
  );

  it(
    'changes the domain on next step if subdomainDelegation and LetsEncrypt are enabled',
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

      this.render(hbs `{{new-cluster-provider-cert
        providerDetailsProxy=providerDetailsProxy
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

      this.render(hbs `{{new-cluster-provider-cert
        providerDetailsProxy=providerDetailsProxy
        _changeDomain=(action "changeDomain")
        _location=_location
        nextStep=(action "nextStep")
      }}`);

      return wait().then(() => {
        return click('.toggle-field-letsEncryptEnabled').then(() => {
          return click('.btn-cert-next').then(() => {
            expect(changeDomain, 'changeDomain').to.be.not.called;
            expect(nextStep, 'nextStep').to.be.called;
          });
        });
      });
    }
  );
});
