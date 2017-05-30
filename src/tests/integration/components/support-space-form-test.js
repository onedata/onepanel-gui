import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

import storageManagerStub from '../../helpers/storage-manager-stub';
import globalNotifyStub from '../../helpers/global-notify-stub';
import FormHelper from '../../helpers/form';

const {
  RSVP: { Promise },
} = Ember;

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
    integration: true,

    setup() {
      this.prepareAllFields = function () {
        this.set('_selectedStorage', {
          name: 'POSIX',
          id: 'posix',
        });
        this.set('formValues', Ember.Object.create({
          token: 'some_token',
          size: '100',
          sizeUnit: 'mb',
          // _importEnabled: false
        }));
      };

      this.expectException = function (expectedError) {
        Ember.Test.adapter.exception = (error) => {
          if (error !== expectedError) {
            this.originalException(error);
          }
        };
        Ember.Logger.error = (error) => {
          if (error !== expectedError) {
            this.originalLoggerError(error);
          }
        };
      };
    },
  });

  beforeEach(function () {
    this.register('service:storage-manager', storageManagerStub);
    this.inject.service('storage-manager', { as: 'storageManager' });

    this.register('service:global-notify', globalNotifyStub);
    this.inject.service('global-notify', { as: 'globaNotify' });

    // TODO make some common helper for disabling global exception handling
    this.originalException = Ember.Test.adapter.exception;
    this.originalLoggerError = Ember.Logger.error;
  });

  afterEach(function () {
    Ember.Test.adapter.exception = this.originalException;
    Ember.Logger.error = this.originalLoggerError;
  });

  it('submits size multiplicated by chosen unit', function (done) {
    let sizeToInput = 30;
    let unit = 'tb';
    let sizeOutput = sizeToInput * UNITS[unit];

    let submitInvoked = false;
    this.on('submitSupportSpace', function (supportSpaceData) {
      let { size } = supportSpaceData;
      expect(size).to.equal(sizeOutput);
      submitInvoked = true;
      return new Promise(resolve => resolve());
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
    helper.getInput('main-token').val('some token').change();
    helper.getInput('main-size').val(sizeToInput.toString()).change();
    helper.getInput('main-sizeUnit-' + unit).click();
    wait().then(() => {
      helper.submit();
      wait().then(() => {
        expect(submitInvoked).to.be.true;
        done();
      });
    });
  });

  it('shows a global error notify when submit fails', function (done) {
    let globalNotify = this.container.lookup('service:globalNotify');
    let errorInvoked = false;
    globalNotify.set('backendError', function () {
      errorInvoked = true;
    });
    this.prepareAllFields();

    const EXPECTED_ERROR = 'some error';
    this.expectException(EXPECTED_ERROR);
    this.on('submitSupportSpace', function () {
      let promise = new Promise((_, reject) => reject(EXPECTED_ERROR));
      return promise;
    });

    this.render(hbs `
      {{support-space-form
        submitSupportSpace=(action "submitSupportSpace")
        _selectedStorage=_selectedStorage
        values=formValues
      }}
    `);

    this.$('button[type=submit]').click();

    wait().then(() => {
      expect(errorInvoked).to.be.true;
      done();
    });
  });
});
