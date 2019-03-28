import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

const OnezoneGui = Service.extend({
  getCanEnterViaOnezoneProxy() {},
  getOnepanelNavUrlInOnezone() {},
});

describe('Integration | Component | login box/login form container', function () {
  setupComponentTest('login-box/login-form-container', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onezone-gui', OnezoneGui);
  });

  it('renders Onezone button when there is Onezone URL and allows to toggle auth view',
    function () {
      const onezoneUrl = 'https://example.com/visit';
      const onezoneGui = lookupService(this, 'onezone-gui');
      sinon.stub(onezoneGui, 'getCanEnterViaOnezoneProxy').resolves(true);
      sinon.stub(onezoneGui, 'getOnepanelNavUrlInOnezone').returns(onezoneUrl);

      this.render(hbs `{{login-box/login-form-container}}`);

      return wait().then(() => {
        const $onezoneButtonContainer = this.$('.onezone-button-container');
        expect($onezoneButtonContainer).to.exist;
        expect($onezoneButtonContainer).to.not.have.class('hide');
        expect($onezoneButtonContainer.find('.btn-login-onezone').attr('href'))
          .to.equal(onezoneUrl);
        const $basicauthContainer = this.$('.basicauth-login-form-container');
        expect($basicauthContainer).to.have.class('hide');

        return click('.username-login-toggle')
          .then(() => {
            expect($onezoneButtonContainer).to.have.class('fadeOut');
            expect($basicauthContainer).to.not.have.class('hide');
          });
      });
    });

  it('renders only basicauth when cannot enter via Onezone',
    function () {
      const onezoneGui = lookupService(this, 'onezone-gui');
      sinon.stub(onezoneGui, 'getCanEnterViaOnezoneProxy').resolves(false);

      this.render(hbs `{{login-box/login-form-container}}`);

      return wait().then(() => {
        const $onezoneButtonContainer = this.$('.onezone-button-container');
        expect($onezoneButtonContainer).to.not.exist;
        const $basicauthContainer = this.$('.basicauth-login-form-container');
        expect($basicauthContainer).to.not.have.class('hide');
      });
    });
});
