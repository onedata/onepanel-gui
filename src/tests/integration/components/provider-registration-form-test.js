import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { click, fillIn } from 'ember-native-dom-helpers';
import FormHelper from '../../helpers/form';

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
    'renders name, zone domain, subdomain delegation, latitude and logitude fields in new mode',
    function () {
      this.on('submit', function () {});

      this.render(hbs `{{provider-registration-form mode="new" submit=(action "submit")}}`);

      let helper = new ProviderRegistrationHelper(this.$());
      ['editTop-name', 'editTop-onezoneDomainName', 'editSubdomain-subdomain',
        'editBottom-geoLatitude', 'editBottom-geoLongitude',
      ]
      .forEach(fname => {
        expect(helper.getInput(fname), `${fname} field`).to.exist;
      });

    }
  );

  it('changes hostname/subdomain visibility with toggle', function (done) {
    this.render(hbs `
      {{provider-registration-form
        mode="new"}}`);

    const toggleSelector = '.toggle-field-editTop-subdomainDelegation';
    const subdomainInputSelector = '.field-editSubdomain-subdomain';
    const hostnameInputSelector = '.field-editDomain-domain';

    expect(this.$(toggleSelector)).to.have.class('checked');
    expect(this.$(subdomainInputSelector)).to.exist;
    expect(this.$(hostnameInputSelector)).not.to.exist;
    click(toggleSelector).then(() => {
      expect(this.$(toggleSelector)).not.to.have.class('checked');
      expect(this.$(subdomainInputSelector)).not.to.exist;
      expect(this.$(hostnameInputSelector)).to.exist;
      click(toggleSelector).then(() => {
        expect(this.$(toggleSelector)).to.have.class('checked');
        expect(this.$(subdomainInputSelector)).to.exist;
        expect(this.$(hostnameInputSelector)).not.to.exist;
        done();
      });
    });
  });

  it('checks for excluded subdomains', function (done) {
    const excludedSubdomains = ['a', 'b'];
    this.set('excludedSubdomains', excludedSubdomains);
    this.render(hbs `
      {{provider-registration-form
        mode="new"
        excludedSubdomains=excludedSubdomains}}`);

    const subdomainInputSelector = '.field-editSubdomain-subdomain';
    expect(this.$('.has-error')).not.to.exist;
    fillIn(subdomainInputSelector, 'a').then(() => {
      expect(this.$('.has-error')).to.contain('Subdomain');
      fillIn(subdomainInputSelector, 'ab').then(() => {
        expect(this.$('.has-success')).to.contain('Subdomain');
        done();
      });
    });
  });

  it('accepts IP address in onezone domain and provider domain fields',
    function (done) {
      this.render(hbs `
        {{provider-registration-form
          mode="new"}}`);

      click('.toggle-field-editTop-subdomainDelegation').then(() => {
        fillIn('.field-editTop-onezoneDomainName', '10.10.10.10').then(() => {
          fillIn('.field-editDomain-domain', '12.12.12.12').then(() => {
            expect(this.$('.has-error')).not.to.exist;
            done();
          });
        });
      });
    }
  );

  it('accepts domain name in onezone domain and provider domain fields',
    function (done) {
      this.render(hbs `
        {{provider-registration-form
          mode="new"}}`);

      click('.toggle-field-editTop-subdomainDelegation').then(() => {
        fillIn('.field-editTop-onezoneDomainName', 'abc.def.com').then(() => {
          fillIn('.field-editDomain-domain', 'xyz.com').then(() => {
            expect(this.$('.has-error')).not.to.exist;
            done();
          });
        });
      });
    }
  );
});
