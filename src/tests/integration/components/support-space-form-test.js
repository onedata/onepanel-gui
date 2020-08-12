import EmberObject, { set } from '@ember/object';
import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import sinon from 'sinon';
import { reject } from 'rsvp';
import StorageManagerStub from '../../helpers/storage-manager-stub';
import SpaceManagerStub from '../../helpers/space-manager-stub';
import FormHelper from '../../helpers/form';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import { registerService, lookupService } from '../../helpers/stub-service';
import { click, fillIn } from 'ember-native-dom-helpers';

const UNITS = {
  mib: Math.pow(1024, 2),
  gib: Math.pow(1024, 3),
  tib: Math.pow(1024, 4),
};

class SupportSpaceFormHelper extends FormHelper {
  constructor($template) {
    super($template, '.support-space-form');
  }
}

class StorageSelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.form .form-group:first-child .ember-basic-dropdown');
  }
}

describe('Integration | Component | support space form', function () {
  setupComponentTest('support-space-form', {
    integration: true,

    setup() {
      this.prepareAllFields = function () {
        this.set('formValues', EmberObject.create({
          token: 'some_token',
          size: '100',
          sizeUnit: 'mib',
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
    registerService(this, 'storage-manager', StorageManagerStub);
    registerService(this, 'space-manager', SpaceManagerStub);
    const storageManager = lookupService(this, 'storage-manager');
    const spaceManager = lookupService(this, 'space-manager');

    set(storageManager, '__storages', {
      storage1: {
        id: 'storage1',
        name: 'Storage1',
        importedStorage: false,
      },
      storage2: {
        id: 'storage2',
        name: 'Storage2',
        importedStorage: true,
      },
      storage3: {
        id: 'storage3',
        name: 'Storage3',
        importedStorage: true,
      },
    });

    set(spaceManager, '__spaces', [{
      id: 'space1',
      name: 'Space1',
      storageId: 'storage3',
    }, {
      id: 'space2',
      name: 'Space2',
      storageId: 'storage1',
    }]);

    // TODO make some common helper for disabling global exception handling
    this.originalException = Ember.Test.adapter.exception;
    this.originalLoggerError = Ember.Logger.error;
  });

  afterEach(function () {
    Ember.Test.adapter.exception = this.originalException;
    Ember.Logger.error = this.originalLoggerError;
  });

  it(
    'does not disable storages with importedStorage equals false',
    function () {
      this.render(hbs `{{support-space-form}}`);

      let storagesSelectHelper;
      return wait()
        .then(() => {
          storagesSelectHelper = new StorageSelectHelper();
          return storagesSelectHelper.open();
        })
        .then(() => {
          const firstStorageItem = storagesSelectHelper.getNthOption(1);
          expect(firstStorageItem.getAttribute('aria-disabled')).to.be.null;
          expect(firstStorageItem.querySelector('.imported-used-storage'))
            .to.be.null;
          expect(firstStorageItem.querySelector('.imported-storage')).to.be.null;
        });
    }
  );

  it('does not disable storage without support and with importedStorage', function () {
    this.render(hbs `{{support-space-form}}`);

    let storagesSelectHelper;
    return wait()
      .then(() => {
        storagesSelectHelper = new StorageSelectHelper();
        return storagesSelectHelper.open();
      })
      .then(() => {
        const firstStorageItem = storagesSelectHelper.getNthOption(2);
        expect(firstStorageItem.getAttribute('aria-disabled')).to.be.null;
        expect(firstStorageItem.querySelector('.imported-used-storage'))
          .to.be.null;
        expect(firstStorageItem.querySelector('.imported-storage').innerText)
          .to.equal('(import-enabled)');
      });
  });

  it(
    'disables storages with support and importedStorage equals true',
    function () {
      this.render(hbs `{{support-space-form}}`);

      let storagesSelectHelper;
      return wait()
        .then(() => {
          storagesSelectHelper = new StorageSelectHelper();
          return storagesSelectHelper.open();
        })
        .then(() => {
          const firstStorageItem = storagesSelectHelper.getNthOption(3);
          expect(firstStorageItem.getAttribute('aria-disabled')).to.equal('true');
          expect(firstStorageItem.querySelector('.imported-used-storage').innerText)
            .to.equal('(import-enabled, already in use)');
        });
    }
  );

  it('renders unchecked disabled import toggle if storage is not imported',
    function () {
      this.render(hbs `{{support-space-form}}`);

      return wait()
        .then(() => {
          const helper = new SupportSpaceFormHelper(this.$());
          expect(helper.getToggleInput('main-importEnabled'))
            .to.have.class('disabled');
          expect(helper.getToggleInput('main-importEnabled'))
            .to.not.have.class('checked');
        });
    }
  );

  it('renders checked non-disabled import toggle if storage is imported', function () {
    this.render(hbs `{{support-space-form}}`);

    return wait()
      .then(() => selectStorageWithImport(this))
      .then(() => {
        return wait()
          .then(() => {
            const helper = new SupportSpaceFormHelper(this.$());
            expect(helper.getToggleInput('main-importEnabled'))
              .to.not.have.class('disabled');
            expect(helper.getToggleInput('main-importEnabled'))
              .to.have.class('checked');
          });
      });
  });

  it('submits size multiplicated by chosen unit', function () {
    const sizeToInput = 30;
    const unit = 'tib';
    const sizeOutput = sizeToInput * UNITS[unit];
    const submitStub = sinon.stub().resolves();
    this.on('submit', submitStub);
    this.prepareAllFields();

    this.render(hbs `
      {{support-space-form
        submitSupportSpace=(action "submit")
      }}
    `);

    let helper;
    return wait()
      .then(() => {
        helper = new SupportSpaceFormHelper(this.$());
        return fillIn(helper.getInput('main-token')[0], 'some token');
      })
      .then(() => fillIn(helper.getInput('main-size')[0], sizeToInput.toString()))
      .then(() => click(helper.getInput('main-sizeUnit-' + unit)[0]))
      .then(() => helper.submit())
      .then(() => {
        expect(submitStub).to.be.calledOnce;
        expect(submitStub).to.be.calledWith(sinon.match.has('size', sizeOutput));
      });
  });

  it('shows a global error notify when submit fails', function () {
    const globalNotify = lookupService(this, 'global-notify');
    const backendError = sinon.spy(globalNotify, 'backendError');
    this.prepareAllFields();

    const EXPECTED_ERROR = 'some error';
    this.expectException(EXPECTED_ERROR);
    this.on('submit', sinon.stub().returns(reject(EXPECTED_ERROR)));

    this.render(hbs `
      {{support-space-form
        submitSupportSpace=(action "submit")
        values=formValues
      }}
    `);

    return wait()
      .then(() => click('button[type=submit]'))
      .then(() => expect(backendError).to.be.calledOnce);
  });

  it('hides import form when selected storage is not imported', function () {
    this.render(hbs `{{support-space-form}}`);

    return wait().then(() => {
      expect(
        this.$('.import-configuration-section').parents('.collapse-hidden')
      ).to.exist;
    });
  });

  it('shows import form when selected storage is imported', function () {
    this.render(hbs `{{support-space-form}}`);

    return wait()
      .then(() => selectStorageWithImport(this))
      .then(() => {
        expect(
          this.$('.import-configuration-section').parents('.collapse-hidden')
        ).to.not.exist;
      });
  });

  it('reacts to invalid data in import form', function () {
    this.prepareAllFields();

    this.render(hbs `{{support-space-form values=formValues}}`);

    return wait()
      .then(() => selectStorageWithImport(this))
      .then(() => fillIn('.field-generic-maxDepth', 'bad value'))
      .then(() => expect(this.$('button[type=submit]')).to.be.disabled);
  });

  it('submits data from import form', function () {
    const submitStub = sinon.stub().resolves();
    this.prepareAllFields();
    this.on('submit', submitStub);

    this.render(hbs `
      {{support-space-form
        submitSupportSpace=(action "submit")
        values=formValues
      }}
    `);

    return wait()
      .then(() => selectStorageWithImport(this))
      .then(() => click('.toggle-field-generic-continuousImport'))
      .then(() => new SupportSpaceFormHelper(this.$()).submit())
      .then(() => {
        expect(submitStub).to.be.calledOnce;
        expect(submitStub).to.be.calledWith(
          sinon.match.hasNested('storageUpdate.strategy', 'no_update')
        );
      });
  });
});

function selectStorageWithImport(testCase) {
  const storagesHelper = new StorageSelectHelper(testCase.$());
  return storagesHelper.selectOption(2);
}
