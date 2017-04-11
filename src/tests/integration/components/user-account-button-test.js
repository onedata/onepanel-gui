import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

import onepanelServerStub from '../../helpers/onepanel-server-stub';

describe('Integration | Component | user account button', function () {
  setupComponentTest('user-account-button', {
    integration: true
  });

  beforeEach(function () {
    this.register('service:onepanel-server', onepanelServerStub);
    this.inject.service('onepanel-server', { as: 'onepanelServer' });
  });

  it('renders username got from onepanel server', function () {

    let onepanelServer = this.container.lookup('service:onepanelServer');
    let someUsername = 'some_username';
    onepanelServer.set('username', someUsername);

    this.render(hbs `{{user-account-button}}`);
    expect(this.$().text()).to.match(new RegExp(someUsername));
  });

  it('shows a user account menu on click',
    function (done) {
      this.render(hbs `{{user-account-button}}`);

      this.$('.user-account-button').click();
      wait().then(() => {
        expect($('.user-account-menu')).to.be.visible;
        done();
      });
    });
});
