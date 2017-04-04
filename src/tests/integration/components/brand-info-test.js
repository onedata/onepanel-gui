import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import i18n from 'ember-i18n/services/i18n';
import brandInfoTranslations from 'onepanel-gui/locales/en/components/brand-info';

const {
  Service,
} = Ember;

const onepanelServerStub = Service.extend({
  serviceType: 'provider',
  init() {
    this._super(...arguments);
  }
});

describe('Integration | Component | brand info', function () {
  setupComponentTest('brand-info', {
    integration: true,
  });

  beforeEach(function () {
    this.register('service:onepanel-server', onepanelServerStub);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });

    this.register('service:i18n', i18n);
    this.inject.service('i18n', { as: 'i18n' });
  });

  it('displays translated service type name taken from onepanel server', function (done) {
    let onepanelServer = this.container.lookup('service:onepanelServer');
    this.render(hbs `{{brand-info}}`);

    onepanelServer.set('serviceType', 'zone');
    wait().then(() => {
      expect(this.$().text()).to.match(
        new RegExp(brandInfoTranslations.serviceType.zone)
      );
      onepanelServer.set('serviceType', 'provider');
      wait().then(() => {
        expect(this.$().text()).to.match(
          new RegExp(brandInfoTranslations.serviceType.provider)
        );
        done();
      });
    });
  });
});
