import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import FormHelper from '../../helpers/form';

class ProviderRegistrationHelper extends FormHelper {
  constructor(template) {
    super(template, '.provider-registration-form');
  }
}

describe('Integration | Component | provider registration form', function () {
  setupRenderingTest();

  it(
    'renders name, domain, latitude and logitude fields in new mode',
    async function () {
      this.set('submit', function () {});

      await render(hbs `
        {{provider-registration-form mode="new" submit=(action submit)}}
      `);

      const helper = new ProviderRegistrationHelper(this.element);
      [
        'editTop-name',
        'editDomain-domain',
        'editBottom-adminEmail',
        'editBottom-geoLatitude',
        'editBottom-geoLongitude',
      ]
      .forEach(fname => {
        expect(helper.getInput(fname), `${fname} field`).to.exist;
      });
    }
  );

  it('changes hostname/subdomain visibility with toggle', async function () {
    await render(hbs `
      {{provider-registration-form
        mode="new"
        subdomainDelegationSupported=true
      }}`);

    const toggleSelector = '.toggle-field-editTop-subdomainDelegation';
    const subdomainInputSelector = '.field-editSubdomain-subdomain';
    const hostnameInputSelector = '.field-editDomain-domain';

    expect(this.$(toggleSelector), 'subdomain toggle')
      .to.have.class('checked');
    expect(this.$(subdomainInputSelector)).to.exist;
    expect(this.$(hostnameInputSelector)).not.to.exist;

    await click(toggleSelector);
    expect(this.$(toggleSelector)).not.to.have.class('checked');
    expect(this.$(subdomainInputSelector)).not.to.exist;
    expect(this.$(hostnameInputSelector)).to.exist;

    await click(toggleSelector);
    expect(this.$(toggleSelector)).to.have.class('checked');
    expect(this.$(subdomainInputSelector)).to.exist;
    expect(this.$(hostnameInputSelector)).not.to.exist;
  });

  it('checks for excluded subdomains', async function () {
    const excludedSubdomains = ['a', 'b'];
    this.set('excludedSubdomains', excludedSubdomains);
    await render(hbs `
      {{provider-registration-form
        mode="new"
        subdomainDelegationSupported=true
        excludedSubdomains=excludedSubdomains}}`);

    const subdomainInputSelector = '.field-editSubdomain-subdomain';
    expect(this.$('.has-error')).not.to.exist;
    await fillIn(subdomainInputSelector, 'a');
    expect(this.$('.has-error')).to.contain('Subdomain');
    await fillIn(subdomainInputSelector, 'ab');
    expect(this.$('.has-success')).to.contain('Subdomain');
  });

  it('accepts IP address in provider domain fields', async function () {
    await render(hbs `
      {{provider-registration-form
        subdomainDelegationSupported=true
        mode="new"
      }}`);

    await click('.toggle-field-editTop-subdomainDelegation');
    await fillIn('.field-editDomain-domain', '12.12.12.12');
    expect(this.$('.has-error')).not.to.exist;
  });

  it('accepts domain name in provider domain fields', async function () {
    await render(hbs `
      {{provider-registration-form
        mode="new"
      }}`);

    await fillIn('.field-editDomain-domain', 'xyz.com');
    expect(this.$('.has-error')).not.to.exist;
  });

  it('accepts valid subdomain field value', async function () {
    await render(hbs `
      {{provider-registration-form
        subdomainDelegationSupported=true
        mode="new"
      }}`);

    await fillIn('.field-editSubdomain-subdomain', 'test');
    expect(this.$('.has-error')).not.to.exist;
  });
});
