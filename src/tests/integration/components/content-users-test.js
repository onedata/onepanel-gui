// import { expect } from 'chai';
// import { describe, it } from 'mocha';
// import { setupComponentTest } from 'ember-mocha';
// import hbs from 'htmlbars-inline-precompile';
// import wait from 'ember-test-helpers/wait';

// import UserDetails from 'onepanel-gui/models/user-details';

// describe('Integration | Component | content users', function () {
//   setupComponentTest('content-users', {
//     integration: true
//   });

//   it('shows username and secret password field by default', function () {
//     const USERNAME = 'Johnny';
//     let user = UserDetails.create({
//       username: USERNAME,
//     });
//     this.set('user', user);

//     this.render(hbs `{{content-users user=user}}`);

//     expect(this.$('.field-username')).to.exist;
//     expect(this.$('.field-secretPassword')).to.exist;

//     expect(this.$('.field-username')).to.contain(USERNAME);
//   });

//   it(
//     'shows old password, new password and retype new password fields when clicked change password',
//     function (done) {
//       const USERNAME = 'Johnny';
//       let user = UserDetails.create({
//         username: USERNAME,
//       });
//       this.set('user', user);

//       this.render(hbs `{{content-users user=user}}`);

//       this.$('.btn-change-password').click();

//       wait().then(() => {
//         expect(this.$('.field-username')).to.exist;
//         expect(this.$('.field-secretPassword')).to.not.exist;
//         expect(this.$('.field-oldPassword')).to.exist;
//         expect(this.$('.field-newPassword')).to.exist;
//         expect(this.$('.field-newPasswordRetype')).to.exist;
//         done();
//       });
//     });
// });
