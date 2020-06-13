import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import _ from 'lodash';

const exampleFormValues = {
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
};

function fillInWholeForm() {
  return fillIn('.field-generic-maxDepth', exampleFormValues.storageUpdate.maxDepth)
    .then(() => click('.toggle-field-generic-syncAcl'))
    .then(() => fillIn(
      '.field-continuous-scanInterval',
      exampleFormValues.storageUpdate.scanInterval
    ))
    .then(() => click('.toggle-field-continuous-writeOnce'));
}

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
    'does not show any continuous import fields if continuous import is disabled',
    function () {
      this.render(hbs `{{storage-import-form}}`);

      return wait()
        .then(() => click('.toggle-field-generic-continuousImport'))
        .then(() => checkContinuousFieldsNotExist(this));
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

  it('shows continuous import fields if continuous import is enabled', function () {
    this.render(hbs `
      {{storage-import-form}}
    `);

    return wait()
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

      return wait()
        .then(() => fillInWholeForm())
        .then(() => click('.toggle-field-generic-continuousImport'))
        .then(() => {
          const correctData = _.cloneDeep(exampleFormValues);
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
        .then(() => {
          const [lastValues, lastValuesAreValid] = changedSpy.lastCall.args;
          expect(lastValues).to.deep.equal(exampleFormValues);
          expect(lastValuesAreValid).to.be.true;
        });
    }
  );

  it(
    'fills in "continuous"-only fields with default values after "continuous" mode turned on in "edit" mode',
    function () {
      const submitSpy = sinon.spy();
      this.setProperties({
        submitSpy,
        defaultValues: {},
      });
      this.render(hbs `
        {{storage-import-form mode="edit" submit=submitSpy defaultValues=defaultValues}}
      `);

      return wait()
        .then(() => click('.toggle-field-generic-continuousImport'))
        .then(() => {
          expect(this.$('.field-continuous-scanInterval')).to.have.value('60');
          expect(this.$('.toggle-field-continuous-writeOnce'))
            .to.not.have.class('checked');
          expect(this.$('.toggle-field-continuous-deleteEnable'))
            .to.have.class('checked');
        });
    }
  );

  it(
    'does not send storageImport request section in "edit" mode ("continuous" import)',
    function () {
      const submitSpy = sinon.spy();
      this.set('submitSpy', submitSpy);
      this.render(hbs `
        {{storage-import-form mode="edit" submit=submitSpy}}
      `);

      return wait()
        .then(() => fillInWholeForm())
        .then(() => click('.submit-import'))
        .then(() => {
          const correctData = _.cloneDeep(exampleFormValues);
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
          expect(this.$('.toggle-field-generic-continuousImport'))
            .to.have.class('checked');
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
