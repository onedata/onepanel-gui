import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | login box/login form container', function () {
  setupComponentTest('login-box/login-form-container', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onepanelServer', Service.extend({
      getOnezoneLogin() {},
    }));
  });

  it('has login with onezone button that redirects to zone login url', function () {
    const onepanelServer = lookupService(this, 'onepanelServer');
    const url = 'http://some.url';
    sinon.stub(onepanelServer, 'getOnezoneLogin')
      .resolves({ url });
    const redirectToOnezoneLogin = sinon.stub();
    this.setProperties({ redirectToOnezoneLogin });

    this.render(hbs `{{login-box/login-form-container
      redirectToOnezoneLogin=redirectToOnezoneLogin
    }}`);

    return click('.btn-login-onezone').then(() => {
      expect(this.$()).to.exist;
      expect(redirectToOnezoneLogin).to.be.calledOnce;
      expect(redirectToOnezoneLogin).to.be.calledWith(url);
    });
  });
});
