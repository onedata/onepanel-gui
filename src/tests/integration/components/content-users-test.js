import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import FormHelper from '../../helpers/form';

import UserDetails from 'onepanel-gui/models/user-details';

class UserCredentialsFormHelper extends FormHelper {
  constructor($template) {
    super($template, '.user-credentials-form');
  }
}

describe('Integration | Component | content users', function () {
  setupComponentTest('content-users', {
    integration: true
  });

  it('shows username and secret password field by default', function () {
    const USERNAME = 'Johnny';
    let user = UserDetails.create({
      username: USERNAME,
    });
    this.set('user', user);

    this.render(hbs `{{content-users user=user}}`);

    let form = new UserCredentialsFormHelper(this.$());

    expect(form.getInput('username'), 'username field')
      .to.exist;
    expect(form.getInput('secretPassword'), 'secretPassword field')
      .to.exist;

    expect(form.getInput('username')).to.contain(USERNAME);
  });

  it(
    'shows old password, new password and retype new password fields when clicked change password',
    function (done) {
      const USERNAME = 'Johnny';
      let user = UserDetails.create({
        username: USERNAME,
      });
      this.set('user', user);

      this.render(hbs `{{content-users user=user}}`);

      this.$('.btn-change-password').click();

      let form = new UserCredentialsFormHelper(this.$());

      wait().then(() => {
        expect(form.getInput('username'), 'field username')
          .to.exist;
        expect(form.getInput('secretPassword'), 'field secretPassword')
          .to.not.exist;
        expect(form.getInput('currentPassword'), 'field currentPassword')
          .to.exist;
        expect(form.getInput('newPassword'), 'field newPassword')
          .to.exist;
        expect(form.getInput('newPasswordRetype'), 'field newPasswordRetype')
          .to.exist;

        done();
      });
    });
});
