import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import _ from 'lodash';

const exampleFormValues = {
  mode: 'auto',
  autoStorageImportConfig: {
    maxDepth: '10',
    syncAcl: true,
    continuousScan: true,
    scanInterval: '20',
    detectModifications: false,
    detectDeletions: true,
  },
};

async function fillInWholeForm() {
  await click('.field-mode-mode-auto');
  await fillIn(
    '.field-generic-maxDepth',
    exampleFormValues.autoStorageImportConfig.maxDepth
  );
  await click('.toggle-field-generic-syncAcl');
  await fillIn(
    '.field-continuous-scanInterval',
    exampleFormValues.autoStorageImportConfig.scanInterval
  );
  await click('.toggle-field-generic-detectModifications');
}

describe('Integration | Component | storage import form', function () {
  setupRenderingTest();

  it('hides submit button if neccessary', async function () {
    await render(hbs `
      {{storage-import-form
        showSubmitButton=false
      }}
    `);

    expect(find('button[type=submit]')).to.not.exist;
  });

  it('has preselected "auto" mode on init', async function () {
    await render(hbs `{{storage-import-form}}`);

    expect(find('.field-mode-mode-auto')).to.be.checked;
  });

  context('when import mode is "auto"', function () {
    it('shows auto storage import fields with default values', async function () {
      await render(hbs `{{storage-import-form}}`);

      await click('.field-mode-mode-auto');
      expect(find('.toggle-field-generic-continuousScan'))
        .to.have.class('checked');
      expect(find('.field-generic-maxDepth')).to.have.value('');
      expect(find('.toggle-field-generic-syncAcl')).to.not.have.class('checked');
      expect(find('.field-continuous-scanInterval')).to.have.value('60');
      expect(find('.toggle-field-generic-detectModifications'))
        .to.have.class('checked');
      expect(find('.toggle-field-generic-detectDeletions'))
        .to.have.class('checked');
    });

    it(
      'does not show any continuous scan fields if continuous scan is disabled',
      async function () {
        await render(hbs `{{storage-import-form}}`);

        await click('.field-mode-mode-auto');
        await click('.toggle-field-generic-continuousScan');
        checkContinuousFieldsNotExist();
      }
    );

    it('shows continuous scan fields if continuous scan is enabled',
      async function () {
        await render(hbs `
          {{storage-import-form}}
        `);

        await click('.field-mode-mode-auto');
        checkContinuousFieldsExist();
      });

    it('disables submit button when data is incorrect', async function () {
      await render(hbs `
        {{storage-import-form}}
      `);

      await click('.field-mode-mode-auto');
      await fillIn('.field-generic-maxDepth', 'bad value');
      expect(find('button[type=submit]')).to.have.attr('disabled');
    });

    it(
      'shows continuous scan fields if continuous scan is enabled in defaultValues',
      async function () {
        const formValues = {
          mode: 'auto',
          autoStorageImportConfig: {
            continuousScan: true,
          },
        };
        this.set('formValues', formValues);

        await render(hbs `{{storage-import-form defaultValues=formValues}}`);

        checkContinuousFieldsExist();
      }
    );

    it(
      'notifies about form data modification in "new" mode ("initial" scan)',
      async function () {
        const changedSpy = sinon.spy();
        this.set('changedSpy', changedSpy);
        await render(hbs `
          {{storage-import-form mode="new" valuesChanged=changedSpy}}
        `);

        await fillInWholeForm();
        // disable continuous
        await click('.toggle-field-generic-continuousScan');
        const correctData = _.cloneDeep(exampleFormValues);
        correctData.autoStorageImportConfig.continuousScan = false;
        delete correctData.autoStorageImportConfig.scanInterval;

        const [lastValues, lastValuesAreValid] = changedSpy.lastCall.args;
        expect(lastValues).to.deep.equal(correctData);
        expect(lastValuesAreValid).to.be.true;
      }
    );

    it(
      'notifies about form data modification in "new" mode ("continuous" scan)',
      async function () {
        const changedSpy = sinon.spy();
        this.set('changedSpy', changedSpy);
        await render(hbs `
          {{storage-import-form mode="new" valuesChanged=changedSpy}}
        `);

        await fillInWholeForm();
        const [lastValues, lastValuesAreValid] = changedSpy.lastCall.args;
        expect(lastValues).to.deep.equal(exampleFormValues);
        expect(lastValuesAreValid).to.be.true;
      }
    );

    it(
      'fills in "continuous"-only fields with default values after "continuous" scan turned on in "edit" form mode',
      async function () {
        this.setProperties({
          defaultValues: { mode: 'auto' },
        });
        await render(hbs `
          {{storage-import-form mode="edit" defaultValues=defaultValues}}
        `);

        await click('.toggle-field-generic-continuousScan');
        expect(find('.field-continuous-scanInterval')).to.have.value('60');
      }
    );

    it(
      'shows correct "continuous mode" info message when "continuous scan" is enabled',
      async function () {
        await render(hbs `{{storage-import-form}}`);

        await click('.field-mode-mode-auto');
        expect(find('.continuous-info-msg'))
          .to.contain.text('Continuous scan enabled');
      }
    );

    it(
      'shows correct "continuous mode" info message when "continuous scan" is disabled',
      async function () {
        await render(hbs `{{storage-import-form}}`);

        await click('.field-mode-mode-auto');
        await click('.toggle-field-generic-continuousScan');
        expect(find('.continuous-info-msg'))
          .to.contain.text('Continuous scan disabled');
      }
    );

    it(
      'shows existing import config',
      async function () {
        this.set('exampleConfig', exampleFormValues);
        await render(hbs `
          {{storage-import-form defaultValues=exampleConfig}}
        `);

        expect(find('.field-mode-mode-auto')).to.be.checked;
        expect(find('.toggle-field-generic-continuousScan'))
          .to.have.class('checked');
        expect(find('.field-generic-maxDepth')).to.have.value('10');
        expect(find('.toggle-field-generic-syncAcl')).to.have.class('checked');
        expect(find('.field-continuous-scanInterval')).to.have.value('20');
        expect(find('.toggle-field-generic-detectModifications'))
          .to.not.have.class('checked');
        expect(find('.toggle-field-generic-detectDeletions'))
          .to.have.class('checked');
      }
    );
  });

  context('when import mode is "manual"', function () {
    it('does not show any auto storage import fields', async function () {
      // enforcing "new" form mode to allow "mode" field change
      await render(hbs `{{storage-import-form mode="new"}}`);

      await click('.field-mode-mode-manual');
      [
        '.toggle-field-generic-continuousScan',
        '.field-generic-maxDepth',
        '.toggle-field-generic-syncAcl',
        '.field-continuous-scanInterval',
        '.toggle-field-continuous-detectModifications',
        '.toggle-field-continuous-detectDeletions',
      ].forEach(selector => expect(find(selector)).to.not.exist);
    });

    it('does not show "continuous mode" info message', async function () {
      // enforcing "new" form mode to allow "mode" field change
      await render(hbs `{{storage-import-form mode="new"}}`);

      await click('.field-mode-mode-manual');
      expect(find('.continuous-info-msg')).to.not.exist;
    });

    it(
      'shows existing import config',
      async function () {
        this.set('exampleConfig', { mode: 'manual' });
        await render(hbs `
          {{storage-import-form defaultValues=exampleConfig}}
        `);

        expect(find('.field-mode-mode-manual')).to.be.checked;
      }
    );

    it('allows to submit', async function () {
      const submitSpy = this.set('submitSpy', sinon.spy());

      // enforcing "new" form mode to allow "mode" field change
      await render(hbs `{{storage-import-form mode="new" submit=submitSpy}}`);

      await click('.field-mode-mode-manual');
      await click('.submit-import');
      expect(submitSpy).to.be.calledOnce.and.to.be.calledWith(sinon.match({
        mode: 'manual',
      }));
    });
  });

  it('notifies about initial values on init', async function () {
    const changedSpy = sinon.spy();
    this.set('changedSpy', changedSpy);
    await render(hbs `
      {{storage-import-form valuesChanged=changedSpy mode="new"}}
    `);

    expect(changedSpy).to.be.calledOnce.and.to.be.calledWith(sinon.match({
      mode: 'auto',
      autoStorageImportConfig: sinon.match({
        continuousScan: true,
        syncAcl: false,
        scanInterval: '60',
        detectModifications: true,
        detectDeletions: true,
      }),
    }));
  });

  it('notifies about mode changed to "manual"', async function () {
    const changedSpy = sinon.spy();
    this.set('changedSpy', changedSpy);
    // enforcing "new" form mode to allow "mode" field change
    await render(hbs `{{storage-import-form mode="new" valuesChanged=changedSpy}}`);

    await click('.field-mode-mode-manual');
    expect(changedSpy).to.be.calledTwice.and.to.be.calledWith(sinon.match({
      mode: 'manual',
    }));
  });

  it('has enabled "mode" field in "new" form mode', async function () {
    await render(hbs `{{storage-import-form mode="new"}}`);

    expect(find('.field-mode-mode input')).to.not.have.attr('disabled');
  });

  it('has disabled "mode" field in "edit" form mode', async function () {
    await render(hbs `{{storage-import-form mode="edit"}}`);

    expect(find('.field-mode-mode input')).to.have.attr('disabled');
  });
});

const continuousFieldsSelectors = [
  '.field-continuous-scanInterval',
];

function checkContinuousFieldsExist() {
  continuousFieldsSelectors.forEach(selector =>
    expect(find(selector)).to.exist
  );
}

function checkContinuousFieldsNotExist() {
  continuousFieldsSelectors.forEach(selector =>
    expect(find(selector)).to.not.exist
  );
}
