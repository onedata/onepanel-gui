import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';

const OnezoneGui = Service.extend({
  getCanEnterViaOnezoneProxy() {},
  getOnepanelNavUrlInOnezone() {},
});

describe('Integration | Component | login box/login form container', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onezone-gui', OnezoneGui);
  });

  it('renders Onezone button when there is Onezone URL and allows to toggle auth view',
    async function() {
      const onezoneUrl = 'https://example.com/visit';
      const onezoneGui = lookupService(this, 'onezone-gui');
      sinon.stub(onezoneGui, 'getCanEnterViaOnezoneProxy').resolves(true);
      sinon.stub(onezoneGui, 'getOnepanelNavUrlInOnezone').returns(onezoneUrl);

      await render(hbs `{{login-box/login-form-container}}`);

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

  it('renders Onezone button as disabled when cannot enter via Onezone',
    async function() {
      const onezoneGui = lookupService(this, 'onezone-gui');
      sinon.stub(onezoneGui, 'getCanEnterViaOnezoneProxy').resolves(false);

      await render(hbs `{{login-box/login-form-container}}`);

      return wait().then(() => {
        const $onezoneButton = this.$('.btn-login-onezone');
        expect($onezoneButton).to.have.attr('disabled');
      });
    });
});
