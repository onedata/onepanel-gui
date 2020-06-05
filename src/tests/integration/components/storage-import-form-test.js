import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | storage import form', function () {
  setupComponentTest('storage-import-form', {
    integration: true,
  });

  it('hides submit button if neccessary', function () {
    this.render(hbs `
      {{storage-import-form
        showSubmitButton=false
      }}
    `);

    return wait().then(() => expect(this.$('button[type=submit]')).to.not.exist);
  });

  it(
    'does not show any continuous import fields if import mode is initial',
    function () {
      this.render(hbs `{{storage-import-form}}`);

      return wait().then(() => checkContinuousFieldsNotExist(this));
    }
  );

  it(
    'shows continuous import fields if update strategy is selected on init',
    function () {
      const space = {
        storageImport: {
          strategy: 'simple_scan',
        },
        storageUpdate: {
          strategy: 'simple_scan',
        },
      };

      this.set('space', space);

      this.render(hbs `
        {{storage-import-form
          defaultValues=space
        }}
      `);

      return wait().then(() => checkContinuousFieldsExist(this));
    }
  );

  it('shows continuous import fields on import mode change', function () {
    this.render(hbs `
      {{storage-import-form}}
    `);

    return wait()
      .then(() => click('.field-generic-importMode-continuous'))
      .then(() => checkContinuousFieldsExist(this));
  });

  it('disables submit button when data is incorrect', function () {
    this.render(hbs `
      {{storage-import-form mode="new"}}
    `);

    return wait()
      .then(() => fillIn('.field-generic-maxDepth', 'bad value'))
      .then(() => expect(this.$('button[type=submit]')).to.be.disabled);
  });

  it(
    'notifies about form data modification in "new" mode ("initial" import)',
    function () {
      const changedSpy = sinon.spy();
      this.set('changedSpy', changedSpy);
      this.render(hbs `
      {{storage-import-form mode="new" valuesChanged=changedSpy}}
    `);

      let correctData;
      return wait()
        .then(() => fillInWholeForm().then(data => correctData = data))
        .then(() => click('.field-generic-importMode-initial'))
        .then(() => {
          delete correctData.storageUpdate;
          correctData.storageUpdate = {
            strategy: 'no_update',
          };
          const [lastValues, lastValuesAreValid] = changedSpy.lastCall.args;
          expect(lastValues).to.deep.equal(correctData);
          expect(lastValuesAreValid).to.be.true;
        });
    }
  );

  it(
    'notifies about form data modification in "new" mode ("continuous" import)',
    function () {
      const changedSpy = sinon.spy();
      this.set('changedSpy', changedSpy);
      this.render(hbs `
      {{storage-import-form mode="new" valuesChanged=changedSpy}}
    `);

      return wait()
        .then(() => fillInWholeForm())
        .then(correctData => {
          const [lastValues, lastValuesAreValid] = changedSpy.lastCall.args;
          expect(lastValues).to.deep.equal(correctData);
          expect(lastValuesAreValid).to.be.true;
        });
    }
  );

  it(
    'does not send storageImport section in "edit" mode ("continuous" import)',
    function () {
      const submitSpy = sinon.spy();
      this.set('submitSpy', submitSpy);
      this.render(hbs `
        {{storage-import-form mode="edit" submit=submitSpy}}
      `);

      let correctData;
      return wait()
        .then(() => fillInWholeForm().then(data => correctData = data))
        .then(() => click('.submit-import'))
        .then(() => {
          delete correctData.storageImport;
          expect(submitSpy.lastCall.args[0]).to.deep.equal(correctData);
        });
    }
  );

  it(
    'prefers update config over import config, when both are different in "edit" mode default values',
    function () {
      const exampleConfig = {
        storageImport: {
          strategy: 'simple_scan',
          maxDepth: '10',
          syncAcl: false,
        },
        storageUpdate: {
          strategy: 'simple_scan',
          maxDepth: '11',
          syncAcl: true,
          scanInterval: '20',
          writeOnce: true,
          deleteEnable: true,
        },
      };
      this.set('exampleConfig', exampleConfig);
      this.render(hbs `
        {{storage-import-form mode="edit" defaultValues=exampleConfig}}
      `);

      return wait()
        .then(() => {
          expect(this.$('.field-generic-importMode-continuous'))
            .to.have.prop('checked', true);
          expect(this.$('.field-generic-maxDepth').val()).to.equal('11');
          expect(this.$('.toggle-field-generic-syncAcl')).to.have.class('checked');
          expect(this.$('.field-continuous-scanInterval')).to.have.value('20');
          expect(this.$('.toggle-field-continuous-writeOnce'))
            .to.have.class('checked');
          expect(this.$('.toggle-field-continuous-deleteEnable'))
            .to.have.class('checked');
        });
    }
  );
});

const continuousFieldsSelectors = [
  '.field-continuous-scanInterval',
  '.toggle-field-continuous-writeOnce',
  '.toggle-field-continuous-deleteEnable',
];

function checkContinuousFieldsExist(testCase) {
  continuousFieldsSelectors.forEach(selector =>
    expect(testCase.$(selector)).to.exist
  );
}

function checkContinuousFieldsNotExist(testCase) {
  continuousFieldsSelectors.forEach(selector =>
    expect(testCase.$(selector)).to.not.exist
  );
}

function fillInWholeForm() {
  return click('.field-generic-importMode-continuous')
    .then(() => fillIn('.field-generic-maxDepth', '10'))
    .then(() => click('.toggle-field-generic-syncAcl'))
    .then(() => fillIn('.field-continuous-scanInterval', '20'))
    .then(() => click('.toggle-field-continuous-writeOnce'))
    .then(() => click('.toggle-field-continuous-deleteEnable'))
    .then(() => ({
      storageImport: {
        strategy: 'simple_scan',
        maxDepth: '10',
        syncAcl: true,
      },
      storageUpdate: {
        strategy: 'simple_scan',
        maxDepth: '10',
        syncAcl: true,
        scanInterval: '20',
        writeOnce: true,
        deleteEnable: true,
      },
    }));
}
