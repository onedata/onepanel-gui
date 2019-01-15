import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import UserDetails from 'onepanel-gui/models/user-details';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const GuiUtils = Service.extend({
  fetchGuiVersion: notImplementedReject,
});

const UserManager = Service.extend({
  getCurrentUser: notImplementedReject,
});

describe('Integration | Component | content clusters credentials', function () {
  setupComponentTest('content-clusters-credentials', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'guiUtils', GuiUtils);
    registerService(this, 'userManager', UserManager);

    sinon.stub(lookupService(this, 'guiUtils'), 'fetchGuiVersion')
      .resolves('18.01-mock');

    this.on('fetchOnezoneAccount', async function fetchOnezoneAccount() {
      return {
        zoneName: 'Mock Onezone',
        hostname: 'mock.onezone.example.com',
        username: 'Mock User',
        alias: 'mock_user',
      };
    });
    this.on('fetchClusterDetails', async function fetchClusterDetails() {
      return {
        initStep: 4,
      };
    });
  });

  it('shows username and secret password field by default', function () {
    const username = 'Johnny';
    let user = UserDetails.create({
      username: username,
    });
    this.set('user', user);

    const userManager = lookupService(this, 'user-manager');
    const getCurrentUser = sinon.stub(userManager, 'getCurrentUser');
    getCurrentUser.returns({
      isFulfilled: true,
      isSettled: true,
      isRejected: false,
      content: user,
      username,
    });

    this.render(hbs `{{content-clusters-credentials
      fetchOnezoneAccount=(action "fetchOnezoneAccount")
      fetchClusterDetails=(action "fetchClusterDetails")
    }}
    `);

    return wait().then(() => {
      const $usernameValue = this.$('.field-generic-username');

      expect($usernameValue, 'username value')
        .to.exist;
      expect($usernameValue)
        .to.contain(username);
    });
  });

  it(
    'shows old password, new password and retype new password fields when clicked change password',
    function () {
      const username = 'Johnny';
      let user = UserDetails.create({
        username: username,
      });
      this.set('user', user);

      const userManager = lookupService(this, 'user-manager');
      const getCurrentUser = sinon.stub(userManager, 'getCurrentUser');
      getCurrentUser.returns({
        isFulfilled: true,
        isSettled: true,
        isRejected: false,
        content: user,
        username,
      });

      this.render(hbs `{{content-clusters-credentials
        fetchOnezoneAccount=(action "fetchOnezoneAccount")
        fetchClusterDetails=(action "fetchClusterDetails")
      }}`);

      this.$('.btn-change-password').click();

      return wait({ waitForTimers: false }).then(() => {
        expect(this.$('.field-change-currentPassword'), 'current pass')
          .to.exist;
        expect(this.$('.field-change-newPassword'), 'new pass')
          .to.exist;
        expect(this.$('.field-change-newPasswordRetype'), 'retype pass')
          .to.exist;
      });
    });
});
