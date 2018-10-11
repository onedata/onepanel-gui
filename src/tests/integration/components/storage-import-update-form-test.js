import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

import FormHelper from '../../helpers/form';
import EmberPowerSelectHelper from '../../helpers/ember-power-select-helper';
import StorageImportFormLocales from 'onepanel-gui/locales/en/components/storage-import-update-form';

class StorageImportUpdateFormHelper extends FormHelper {
  constructor($template) {
    super($template, '.storage-import-update-form');
  }
}

class UpdateStrategySelectHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.update-configuration-section .ember-basic-dropdown');
  }
}

const SIMPLE_SCAN_NAME =
  StorageImportFormLocales.storageImport.strategies.simple_scan;

describe('Integration | Component | storage import update form', function () {
  setupComponentTest('storage-import-update-form', {
    integration: true,

    setup() {
      this.prepareAllFields = function () {
        this.set('defaultValues', {
          storageImport: {
            strategy: 'simple_scan',
            maxDepth: 5,
          },
        });
      };
    },
  });

  it('hides submit button if neccessary', function () {
    this.render(hbs `
      {{storage-import-update-form
        showSubmitButton=false
      }}
    `);

    expect(this.$('button[type=submit]')).to.not.exist;
  });

  it('makes import fields static for \'edit\' mode', function () {
    this.prepareAllFields();

    this.render(hbs `
      {{storage-import-update-form
        defaultValues=defaultValues
        mode="edit"
      }}
    `);

    expect(this.$('.one-form-field-static .field-import-strategy').text())
      .to.equal(SIMPLE_SCAN_NAME);
    expect(this.$('.one-form-field-static.field-import_generic-maxDepth').text().trim())
      .to.equal(this.get('defaultValues.storageImport.maxDepth').toString());
  });

  it('does not show any update fields if update strategy is not selected', function () {
    this.render(hbs `
      {{storage-import-update-form}}
    `);

    expect(this.$('.update-configuration-section input')).to.not.exist;
  });

  it('shows fields on update strategy change', function (done) {
    this.render(hbs `
      {{storage-import-update-form}}
    `);

    let helper = new StorageImportUpdateFormHelper(this.$());
    let powerSelectHelper = new UpdateStrategySelectHelper();
    powerSelectHelper.selectOption(2, () => {
      expect(helper.getInput('update_generic-maxDepth')).to.exist;
      expect(helper.getInput('update_generic-scanInterval')).to.exist;
      expect(helper.getToggleInput('update_generic-writeOnce')).to.exist;
      expect(helper.getToggleInput('update_generic-deleteEnable')).to.exist;
      done();
    });
  });

  it('clears inputs on update strategy change', function (done) {
    this.render(hbs `
      {{storage-import-update-form}}
    `);

    let helper = new StorageImportUpdateFormHelper(this.$());
    let powerSelectHelper = new UpdateStrategySelectHelper();
    powerSelectHelper.selectOption(2, () => {
      helper.getInput('update_generic-maxDepth').val('123').change();
      powerSelectHelper.selectOption(1, () => {
        powerSelectHelper.selectOption(2, () => {
          expect(
            helper.getInput('update_generic-maxDepth').val()).to.be.empty;
          done();
        });
      });
    });
  });

  it('disables submit button when data is incorrect', function (done) {
    this.render(hbs `
      {{storage-import-update-form mode="new"}}
    `);

    let helper = new StorageImportUpdateFormHelper(this.$());

    helper.getInput('import_generic-maxDepth').val('bad input').change();
    wait().then(() => {
      expect(this.$('button[type=submit]')).to.be.disabled;
      done();
    });
  });
});
