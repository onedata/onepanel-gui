import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';

import storageManagerStub from '../../helpers/storage-manager-stub';
import FormHelper from '../../helpers/form';

const MEGA = Math.pow(10, 6);
const GIGA = Math.pow(10, 9);
const TERA = Math.pow(10, 12);

const UNITS = {
  mb: MEGA,
  gb: GIGA,
  tb: TERA,
};

class SupportSpaceFormHelper extends FormHelper {
  constructor($template) {
    super($template, '.support-space-form');
  }
}

describe('Integration | Component | support space form', function () {
  setupComponentTest('support-space-form', {
    integration: true
  });

  beforeEach(function () {
    this.register('service:storage-manager', storageManagerStub);
    this.inject.service('storage-manager', { as: 'storageManager' });
  });

  it('submits size multiplicated by chosen unit', function (done) {
    let sizeToInput = 30;
    let unit = 'tb';
    let sizeOutput = sizeToInput * UNITS[unit];

    this.on('submitSupportSpace', function (supportSpaceData) {
      let { size } = supportSpaceData;
      expect(size).to.equal(sizeOutput);
      done();
    });
    this.set('_selectedStorage', {
      name: 'POSIX',
      id: 'posix',
    });
    this.render(hbs `
      {{support-space-form
        submitSupportSpace=(action "submitSupportSpace")
        _selectedStorage=_selectedStorage
      }}
    `);

    let helper = new SupportSpaceFormHelper(this.$());

    // TODO ensure that a storage is selected
    helper.getInput('token').val('some token').change();
    helper.getInput('size').val(sizeToInput.toString()).change();
    helper.getInput('sizeUnit-' + unit).click();
    wait().then(() => {
      helper.submit();
    });
  });
});
