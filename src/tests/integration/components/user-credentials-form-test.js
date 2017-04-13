import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
// import wait from 'ember-test-helpers/wait';

describe('Integration | Component | user credentials form', function () {
  setupComponentTest('user-credentials-form', {
    integration: true
  });

  it('shows username and secret password field by default', function () {
    const USERNAME = 'Johnny';
    this.set('username', USERNAME);

    this.render(hbs `{{user-credentials-form username=username}}`);

    expect(this.$('.field-username'), 'username field exists ')
      .to.exist;
    expect(this.$('.field-secretPassword'), 'secret password field exists')
      .to.exist;
    expect(this.$('.field-username'), 'username field contains username')
      .to.contain(USERNAME);
  });

  // it(
  //   'shows old password, new password and retype new password fields in change password mode',
  //   function (done) {
  //     const USERNAME = 'Johnny';
  //     this.set('username', USERNAME);

  //     this.render(hbs `{{user-credentials-form username=username}}`);

  //     expect(this.$('.btn-change-password')).to.exist;

  //     this.$('.btn-change-password').click();

  //     wait().then(() => {
  //       expect(this.$('.field-username'), 'username field exists')
  //         .to.exist;
  //       expect(this.$('.field-secretPassword'), 'secret pass field not exists')
  //         .to.not.exist;
  //       expect(this.$('.field-oldPassword'), 'old password field exists')
  //         .to.exist;
  //       expect(this.$('.field-newPassword'), 'new password field exists')
  //         .to.exist;
  //       expect(this.$('.field-newPasswordRetype'), 'new pass retype field exists')
  //         .to.exist;

  //       done();
  //     });
  //   });

  // it('allows to submits old and new password', function (done) {
  //   const OLD_PASSWORD = 'one123456789';
  //   const NEW_PASSWORD = 'one987654321';

  //   let submitted = false;
  //   this.on('submit', function ({ oldPassword, newPassword }) {
  //     expect(oldPassword).to.be.equal(OLD_PASSWORD);
  //     expect(newPassword).to.be.equal(NEW_PASSWORD);
  //     submitted = true;
  //   });

  //   this.render(hbs `{{user-credentials-form changePassword=true submit=submit}}`);

  //   this.$('input.field-old-password').val(OLD_PASSWORD).change();
  //   this.$('input.field-new-password').val(NEW_PASSWORD).change();
  //   this.$('input.field-new-password-retype').val(NEW_PASSWORD).change();

  //   this.$('button[type=submit]').click();

  //   wait().then(() => {
  //     expect(submitted).to.be.true;
  //     done();
  //   });
  // });

  // it('does not allow to submit if new passwords do not match', function (done) {
  //   const OLD_PASSWORD = 'one123456789';
  //   const NEW_PASSWORD = 'one987654321';

  //   let submitted = false;
  //   this.on('submit', function () {
  //     submitted = true;
  //   });

  //   this.render(hbs `{{user-credentials-form changePassword=true submit=submit}}`);

  //   this.$('input.field-old-password').val(OLD_PASSWORD).change();
  //   this.$('input.field-new-password').val(NEW_PASSWORD).change();
  //   this.$('input.field-new-password-retype').val(NEW_PASSWORD + 'other').change();

  //   this.$('button[type=submit]').click();

  //   wait().then(() => {
  //     expect(submitted).to.be.false;
  //     done();
  //   });
  // });
});
