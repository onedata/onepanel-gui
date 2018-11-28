import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import FormHelper from '../../helpers/form';
import wait from 'ember-test-helpers/wait';

class ProviderRegistrationHelper extends FormHelper {
  constructor($template) {
    super($template, '.provider-registration-form');
  }
}

describe('Integration | Component | provider registration form', function () {
  setupComponentTest('provider-registration-form', {
    integration: true,
  });

  it(
    'renders token, name, zone domain, Subdomain Delegation, latitude and logitude fields in new mode',
    function () {
      this.on('submit', function () {});

      this.render(hbs `{{provider-registration-form mode="new" submit=(action "submit")}}`);

      let helper = new ProviderRegistrationHelper(this.$());
      return wait().then(() => {
        [
          'newToken-token',
          'editTop-name',
          'editTop-onezoneDomainName',
          'editSubdomain-subdomain',
          'editBottom-geoLatitude',
          'editBottom-geoLongitude',
        ]
        .forEach(fname => {
          expect(helper.getInput(fname), `${fname} field`).to.exist;
        });
      });
    }
  );

  it('changes hostname/subdomain visibility with toggle', function () {
    this.render(hbs `
      {{provider-registration-form
        mode="new"}}`);

    const toggleSelector = '.toggle-field-editTop-subdomainDelegation';
    const subdomainInputSelector = '.field-editSubdomain-subdomain';
    const hostnameInputSelector = '.field-editDomain-domain';

    return wait().then(() => {
      expect(this.$(toggleSelector)).to.have.class('checked');
      expect(this.$(subdomainInputSelector)).to.exist;
      expect(this.$(hostnameInputSelector)).not.to.exist;
      return click(toggleSelector).then(() => {
        expect(this.$(toggleSelector)).not.to.have.class('checked');
        expect(this.$(subdomainInputSelector)).not.to.exist;
        expect(this.$(hostnameInputSelector)).to.exist;
        return click(toggleSelector).then(() => {
          expect(this.$(toggleSelector)).to.have.class('checked');
          expect(this.$(subdomainInputSelector)).to.exist;
          expect(this.$(hostnameInputSelector)).not.to.exist;
        });
      });
    });
  });

  it('checks for excluded subdomains', function () {
    const excludedSubdomains = ['a', 'b'];
    this.set('excludedSubdomains', excludedSubdomains);
    this.render(hbs `
      {{provider-registration-form
        mode="new"
        excludedSubdomains=excludedSubdomains}}`);

    const subdomainInputSelector = '.field-editSubdomain-subdomain';
    return wait().then(() => {
      expect(this.$('.has-error')).not.to.exist;
      return fillIn(subdomainInputSelector, 'a').then(() => {
        expect(this.$('.has-error')).to.contain('Subdomain');
        return fillIn(subdomainInputSelector, 'ab').then(() => {
          expect(this.$('.has-success')).to.contain('Subdomain');
        });
      });
    });
  });

  it('accepts IP address in onezone domain and provider domain fields',
    function () {
      this.render(hbs `
        {{provider-registration-form
          mode="new"}}`);
      return wait().then(() => {
        return click('.toggle-field-editTop-subdomainDelegation').then(() => {
          return fillIn('.field-editTop-onezoneDomainName', '10.10.10.10').then(
            () => {
              return fillIn('.field-editDomain-domain', '12.12.12.12').then(
                () => {
                  expect(this.$('.has-error')).not.to.exist;
                });
            });
        });
      });
    }
  );

  it('accepts domain name in onezone domain and provider domain fields',
    function () {
      this.render(hbs `
        {{provider-registration-form
          mode="new"}}`);
      return wait().then(() => {
        return click('.toggle-field-editTop-subdomainDelegation').then(() => {
          return fillIn('.field-editTop-onezoneDomainName', 'abc.def.com').then(
            () => {
              return fillIn('.field-editDomain-domain', 'xyz.com').then(() => {
                expect(this.$('.has-error')).not.to.exist;
              });
            });
        });
      });
    }
  );

  it('accepts valid subdomain field value', function () {
    this.render(hbs `
      {{provider-registration-form
        mode="new"}}`);

    return wait().then(() => {
      return fillIn('.field-editSubdomain-subdomain', 'test').then(() => {
        expect(this.$('.has-error')).not.to.exist;
      });
    });
  });

  it('disables and fills token field when token is provided', function () {
    this.on('submit', function () {});

    this.render(hbs `{{provider-registration-form
      test2="jeden"
      mode="new"
      submit=(action "submit")
      token="hello-token"
      subdomainDelegation=false
      onezoneDomain="example.com"
    }}`);

    const helper = new ProviderRegistrationHelper(this.$());
    return wait().then(() => {
      const $tokenInput = helper.getInput('newToken-token');
      expect($tokenInput, 'newToken field').to.exist;
      expect($tokenInput).to.have.value('hello-token');
    });
  });
});
