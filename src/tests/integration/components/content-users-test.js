import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import UserDetails from 'onepanel-gui/models/user-details';

describe('Integration | Component | content users', function () {
  setupComponentTest('content-users', {
    integration: true,
  });

  beforeEach(function () {
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

    this.render(hbs `{{content-users
      user=user
      fetchOnezoneAccount=(action "fetchOnezoneAccount")
      fetchClusterDetails = (action "fetchClusterDetails")
    }}
    `);

    const $usernameValue = this.$('.credentials-row-login .row-value');

    expect($usernameValue, 'username value')
      .to.exist;
    expect($usernameValue)
      .to.contain(username);
  });

  it(
    'shows old password, new password and retype new password fields when clicked change password',
    function () {
      const username = 'Johnny';
      let user = UserDetails.create({
        username: username,
      });
      this.set('user', user);

      this.render(hbs `{{content-users
        user=user
        fetchOnezoneAccount=(action "fetchOnezoneAccount")
        fetchClusterDetails = (action "fetchClusterDetails")
      }}`);

      this.$('.btn-change-password-start').click();

      return wait({ waitForTimers: false }).then(() => {
        expect(this.$('.credentials-row-current-password input'), 'current pass')
          .to.exist;
        expect(this.$('.credentials-row-new-password input'), 'new pass')
          .to.exist;
        expect(this.$('.credentials-row-retype-password input'), 'retype pass')
          .to.exist;
      });
    });
});
