import { expect } from 'chai';
import { describe, it, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import _ from 'lodash';

const exampleFormValues = {
  mode: 'auto',
  scanConfig: {
    maxDepth: '10',
    syncAcl: true,
    continuousScan: true,
    scanInterval: '20',
    writeOnce: true,
    detectDeletions: true,
  },
};

function fillInWholeForm() {
  return click('.field-mode-mode-auto')
    .then(() => fillIn('.field-generic-maxDepth', exampleFormValues.scanConfig.maxDepth))
    .then(() => click('.toggle-field-generic-syncAcl'))
    .then(() => fillIn(
      '.field-continuous-scanInterval',
      exampleFormValues.scanConfig.scanInterval
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

  it('has preselected "auto" mode on init', function () {
    this.render(hbs `{{storage-import-form}}`);

    return wait()
      .then(() =>
        expect(this.$('.field-mode-mode-auto')).to.have.prop('checked', true)
      );
  });

  context('when import mode is "auto"', function () {
    it('shows auto storage import fields with default values', function () {
      this.render(hbs `{{storage-import-form}}`);

      return wait()
        .then(() => click('.field-mode-mode-auto'))
        .then(() => {
          expect(this.$('.toggle-field-generic-continuousScan'))
            .to.have.class('checked');
          expect(this.$('.field-generic-maxDepth').val()).to.equal('');
          expect(this.$('.toggle-field-generic-syncAcl')).to.not.have.class('checked');
          expect(this.$('.field-continuous-scanInterval')).to.have.value('60');
          expect(this.$('.toggle-field-continuous-writeOnce'))
            .to.not.have.class('checked');
          expect(this.$('.toggle-field-continuous-detectDeletions'))
            .to.have.class('checked');
        });
    });

    it(
      'does not show any continuous scan fields if continuous scan is disabled',
      function () {
        this.render(hbs `{{storage-import-form}}`);

        return wait()
          .then(() => click('.field-mode-mode-auto'))
          .then(() => click('.toggle-field-generic-continuousScan'))
          .then(() => checkContinuousFieldsNotExist(this));
      }
    );

    it('shows continuous scan fields if continuous scan is enabled', function () {
      this.render(hbs `
        {{storage-import-form}}
      `);

      return wait()
        .then(() => click('.field-mode-mode-auto'))
        .then(() => checkContinuousFieldsExist(this));
    });

    it('disables submit button when data is incorrect', function () {
      this.render(hbs `
        {{storage-import-form}}
      `);

      return wait()
        .then(() => click('.field-mode-mode-auto'))
        .then(() => fillIn('.field-generic-maxDepth', 'bad value'))
        .then(() => expect(this.$('button[type=submit]')).to.be.disabled);
    });

    it(
      'shows continuous scan fields if continuous scan is enabled in defaultValues',
      function () {
        const formValues = {
          mode: 'auto',
          scanConfig: {
            continuousScan: true,
          },
        };
        this.set('formValues', formValues);

        this.render(hbs `{{storage-import-form defaultValues=formValues}}`);

        return wait().then(() => checkContinuousFieldsExist(this));
      }
    );

    it(
      'notifies about form data modification in "new" mode ("initial" scan)',
      function () {
        const changedSpy = sinon.spy();
        this.set('changedSpy', changedSpy);
        this.render(hbs `
          {{storage-import-form mode="new" valuesChanged=changedSpy}}
        `);

        return wait()
          .then(() => fillInWholeForm())
          // disable continuous
          .then(() => click('.toggle-field-generic-continuousScan'))
          .then(() => {
            const correctData = _.cloneDeep(exampleFormValues);
            correctData.scanConfig.continuousScan = false;
            delete correctData.scanConfig.scanInterval;
            delete correctData.scanConfig.writeOnce;
            delete correctData.scanConfig.detectDeletions;

            const [lastValues, lastValuesAreValid] = changedSpy.lastCall.args;
            expect(lastValues).to.deep.equal(correctData);
            expect(lastValuesAreValid).to.be.true;
          });
      }
    );

    it(
      'notifies about form data modification in "new" mode ("continuous" scan)',
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
      'fills in "continuous"-only fields with default values after "continuous" scan turned on in "edit" form mode',
      function () {
        this.setProperties({
          defaultValues: { mode: 'auto' },
        });
        this.render(hbs `
          {{storage-import-form mode="edit" defaultValues=defaultValues}}
        `);

        return wait()
          .then(() => click('.toggle-field-generic-continuousScan'))
          .then(() => {
            expect(this.$('.field-continuous-scanInterval')).to.have.value('60');
            expect(this.$('.toggle-field-continuous-writeOnce'))
              .to.not.have.class('checked');
            expect(this.$('.toggle-field-continuous-detectDeletions'))
              .to.have.class('checked');
          });
      }
    );

    it(
      'shows correct "continuous mode" info message when "continuous scan" is enabled',
      function () {
        this.render(hbs `{{storage-import-form}}`);

        return wait()
          .then(() => click('.field-mode-mode-auto'))
          .then(() =>
            expect(this.$('.continuous-info-msg').text())
            .to.contain('Continous mode enabled')
          );
      }
    );

    it(
      'shows correct "continuous mode" info message when "continuous scan" is disabled',
      function () {
        this.render(hbs `{{storage-import-form}}`);

        return wait()
          .then(() => click('.field-mode-mode-auto'))
          .then(() => click('.toggle-field-generic-continuousScan'))
          .then(() =>
            expect(this.$('.continuous-info-msg').text())
            .to.contain('Continous mode disabled')
          );
      }
    );

    it(
      'shows existing import config',
      function () {
        this.set('exampleConfig', exampleFormValues);
        this.render(hbs `
          {{storage-import-form defaultValues=exampleConfig}}
        `);

        return wait()
          .then(() => {
            expect(this.$('.field-mode-mode-auto')).to.have.prop('checked', true);
            expect(this.$('.toggle-field-generic-continuousScan'))
              .to.have.class('checked');
            expect(this.$('.field-generic-maxDepth').val()).to.equal('10');
            expect(this.$('.toggle-field-generic-syncAcl')).to.have.class('checked');
            expect(this.$('.field-continuous-scanInterval').val()).to.equal('20');
            expect(this.$('.toggle-field-continuous-writeOnce'))
              .to.have.class('checked');
            expect(this.$('.toggle-field-continuous-detectDeletions'))
              .to.have.class('checked');
          });
      }
    );
  });

  context('when import mode is "manual"', function () {
    it('does not show any auto storage import fields', function () {
      // enforcing "new" form mode to allow "mode" field change
      this.render(hbs `{{storage-import-form mode="new"}}`);

      return wait()
        .then(() => click('.field-mode-mode-manual'))
        .then(() => {
          [
            '.toggle-field-generic-continuousScan',
            '.field-generic-maxDepth',
            '.toggle-field-generic-syncAcl',
            '.field-continuous-scanInterval',
            '.toggle-field-continuous-writeOnce',
            '.toggle-field-continuous-detectDeletions',
          ].forEach(selector => expect(this.$(selector)).to.not.exist);
        });
    });

    it('does not show "continuous mode" info message', function () {
      // enforcing "new" form mode to allow "mode" field change
      this.render(hbs `{{storage-import-form mode="new"}}`);

      return wait()
        .then(() => click('.field-mode-mode-manual'))
        .then(() => expect(this.$('.continuous-info-msg')).to.not.exist);
    });

    it(
      'shows existing import config',
      function () {
        this.set('exampleConfig', { mode: 'manual' });
        this.render(hbs `
          {{storage-import-form defaultValues=exampleConfig}}
        `);

        return wait()
          .then(() =>
            expect(this.$('.field-mode-mode-manual')).to.have.prop('checked', true)
          );
      }
    );

    it('allows to submit', function () {
      const submitSpy = this.set('submitSpy', sinon.spy());

      // enforcing "new" form mode to allow "mode" field change
      this.render(hbs `{{storage-import-form mode="new" submit=submitSpy}}`);

      return wait()
        .then(() => click('.field-mode-mode-manual'))
        .then(() => click('.submit-import'))
        .then(() => expect(submitSpy).to.be.calledOnce.and.to.be.calledWith(sinon.match({
          mode: 'manual',
        })));
    });
  });

  it('notifies about initial values on init', function () {
    const changedSpy = sinon.spy();
    this.set('changedSpy', changedSpy);
    this.render(hbs `
      {{storage-import-form valuesChanged=changedSpy}}
    `);

    return wait()
      .then(() => expect(changedSpy).to.be.calledOnce.and.to.be.calledWith(sinon.match({
        mode: 'auto',
        scanConfig: sinon.match({
          continuousScan: true,
          syncAcl: false,
          scanInterval: '60',
          writeOnce: false,
          detectDeletions: true,
        }),
      })));
  });

  it('notifies about mode changed to "manual"', function () {
    const changedSpy = sinon.spy();
    this.set('changedSpy', changedSpy);
    // enforcing "new" form mode to allow "mode" field change
    this.render(hbs `{{storage-import-form mode="new" valuesChanged=changedSpy}}`);

    return wait()
      .then(() => click('.field-mode-mode-manual'))
      .then(() => expect(changedSpy).to.be.calledTwice.and.to.be.calledWith(sinon.match({
        mode: 'manual',
      })));
  });

  it('has enabled "mode" field in "new" form mode', function () {
    this.render(hbs `{{storage-import-form mode="new"}}`);

    return wait()
      .then(() => expect(this.$('.field-mode-mode input')).to.not.have.attr('disabled'));
  });

  it('has disabled "mode" field in "edit" form mode', function () {
    this.render(hbs `{{storage-import-form mode="edit"}}`);

    return wait()
      .then(() => expect(this.$('.field-mode-mode input')).to.have.attr('disabled'));
  });
});

const continuousFieldsSelectors = [
  '.field-continuous-scanInterval',
  '.toggle-field-continuous-writeOnce',
  '.toggle-field-continuous-detectDeletions',
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
