import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

describe(
  'Integration | Component | content clusters emergency passphrase',
  function () {
    setupComponentTest('content-clusters-emergency-passphrase', {
      integration: true,
    });

    it('shows secret password field by default', function () {
      this.render(hbs `{{content-clusters-emergency-passphrase}}`);

      expect(this.$('.field-static-secretPassword'), 'secret pass').to.exist;
    });

    it(
      'shows old password, new password and retype new password fields when clicked change password',
      function () {
        this.render(hbs `{{content-clusters-emergency-passphrase}}`);

        this.$('.btn-change-passphrase').click();

        return wait().then(() => {
          expect(this.$('.field-verify-currentPassword'), 'current pass')
            .to.exist;
          expect(this.$('.field-change-newPassword'), 'new pass')
            .to.exist;
          expect(this.$('.field-change-newPasswordRetype'), 'retype pass')
            .to.exist;
        });
      });
  }
);
