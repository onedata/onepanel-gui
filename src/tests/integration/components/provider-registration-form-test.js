import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import FormHelper from '../../helpers/form';

class ProviderRegistrationHelper extends FormHelper {
  constructor($template) {
    super($template, '.provider-registration-form');
  }
}

describe('Integration | Component | provider registration form', function () {
  setupComponentTest('provider-registration-form', {
    integration: true
  });

  it(
    'renders name, zone domain, redirection point, latitude and logitude fields in new mode',
    function () {
      this.on('submit', function () { });

      this.render(hbs`{{provider-registration-form mode="new" submit=(action "submit")}}`);

      let helper = new ProviderRegistrationHelper(this.$());
      ['main-name', 'main-onezoneDomainName', 'main-redirectionPoint', 'main-geoLatitude', 'main-geoLongitude']
        .forEach(fname => {
          expect(helper.getInput(fname), `${fname} field`).to.exist;
        });

    });

});
