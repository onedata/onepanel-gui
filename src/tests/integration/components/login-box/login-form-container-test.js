import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../../helpers/stub-service';
import Service from '@ember/service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import { resolve } from 'rsvp';

const OnezoneGui = Service.extend({
  isOnezoneAvailable: true,
  updateEnterViaOnezoneProxy: () => resolve(),
  getOnepanelNavUrlInOnezone: notImplementedThrow,
});

describe('Integration | Component | login box/login form container', function () {
  setupComponentTest('login-box/login-form-container', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onepanelServer', Service.extend({
      getOnezoneLogin() {},
      fetchConfiguration: notImplementedReject,
    }));
    registerService(this, 'onezoneGui', OnezoneGui);
  });

  it('has login with onezone button that redirects to zone login url', function () {
    const onepanelServer = lookupService(this, 'onepanelServer');
    const url = 'http://some.url';
    sinon.stub(onepanelServer, 'getOnezoneLogin')
      .resolves({ url });
    const redirectToOnezoneLogin = sinon.stub();
    this.setProperties({ redirectToOnezoneLogin });
    sinon.stub(onepanelServer, 'fetchConfiguration').resolves({
      version: '18.02.0-rc13',
      deployed: true,
      build: '81-g8ae3907',
      onezoneDomain: 'localhost:4201',
      clusterId: 'cluster_id',
    });
    const onezoneGui = lookupService(this, 'onezoneGui');
    onezoneGui.canEnterViaOnezone = true;
    sinon.stub(onezoneGui, 'getOnepanelNavUrlInOnezone').returns(url);

    this.render(hbs `{{login-box/login-form-container
      redirectToOnezoneLogin=redirectToOnezoneLogin
    }}`);

    return wait().then(() => {
      const $btn = this.$('.btn-login-onezone');
      expect($btn, 'login via onezone btn').to.exist;
      expect($btn.attr('href')).to.equal(url);
    });
  });
});
