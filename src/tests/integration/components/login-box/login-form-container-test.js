import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';

const OnezoneGui = Service.extend({
  getCanEnterViaOnezoneProxy() {},
  getOnepanelNavUrlInOnezone() {},
});

describe('Integration | Component | login-box/login-form-container', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onezone-gui', OnezoneGui);
  });

  it('renders Onezone button when there is Onezone URL and allows to toggle auth view',
    async function () {
      const onezoneUrl = 'https://example.com/visit';
      const onezoneGui = lookupService(this, 'onezone-gui');
      sinon.stub(onezoneGui, 'getCanEnterViaOnezoneProxy').resolves(true);
      sinon.stub(onezoneGui, 'getOnepanelNavUrlInOnezone').returns(onezoneUrl);

      await render(hbs `{{login-box/login-form-container}}`);

      const onezoneButtonContainer = find('.onezone-button-container');
      expect(onezoneButtonContainer).to.exist;
      expect(onezoneButtonContainer).to.not.have.class('hide');
      expect(onezoneButtonContainer.querySelector('.btn-login-onezone'))
        .to.have.attr('href', onezoneUrl);
      const basicauthContainer = find('.basicauth-login-form-container');
      expect(basicauthContainer).to.have.class('hide');

      await click('.username-login-toggle');
      expect(onezoneButtonContainer).to.have.class('fadeOut');
      expect(basicauthContainer).to.not.have.class('hide');
    });

  it('renders Onezone button as disabled when cannot enter via Onezone',
    async function () {
      const onezoneGui = lookupService(this, 'onezone-gui');
      sinon.stub(onezoneGui, 'getCanEnterViaOnezoneProxy').resolves(false);

      await render(hbs `{{login-box/login-form-container}}`);

      const onezoneButton = find('.btn-login-onezone');
      expect(onezoneButton).to.have.attr('disabled');
    });
});
