import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe(
  'Integration | Component | content clusters emergency passphrase',
  function () {
    setupRenderingTest();

    it('shows secret password field by default', async function () {
      await render(hbs `{{content-clusters-emergency-passphrase}}`);

      expect(find('.field-static-secretPassword'), 'secret pass').to.exist;
    });

    it(
      'shows old password, new password and retype new password fields when clicked change password',
      async function () {
        await render(hbs `{{content-clusters-emergency-passphrase}}`);

        await click('.btn-change-passphrase');

        expect(find('.field-verify-currentPassword'), 'current pass')
          .to.exist;
        expect(find('.field-change-newPassword'), 'new pass')
          .to.exist;
        expect(find('.field-change-newPasswordRetype'), 'retype pass')
          .to.exist;
      });
  }
);
