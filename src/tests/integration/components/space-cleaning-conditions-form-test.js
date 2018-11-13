import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { fillIn, blur } from 'ember-native-dom-helpers';
import sinon from 'sinon';

describe('Integration | Component | space cleaning conditions form', function () {
  setupComponentTest('space-cleaning-conditions-form', {
    integration: true,
  });

  beforeEach(function () {
    this.set('data', {
      enabled: true,
      lowerFileSizeLimit: { enabled: true, value: 1048576 },
      upperFileSizeLimit: { enabled: true, value: 2097152 },
      minHoursSinceLastOpen: { enabled: true, value: 2 },
      maxOpenCount: { enabled: true, value: 13 },
      maxHourlyMovingAverage: { enabled: true, value: 14 },
      maxDailyMovingAverage: { enabled: true, value: 15 },
      maxMonthlyMovingAverage: { enabled: true, value: 16 },
    });
  });

  it('is filled in with injected data', function () {
    this.render(hbs `
      {{space-cleaning-conditions-form
        data=data
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0}}`);
    const lowerFileSizeLimitGroup = this.$('.lowerFileSizeLimitGroup');
    const upperFileSizeLimitGroup = this.$('.upperFileSizeLimitGroup');
    const timeGroup = this.$('.minHoursSinceLastOpenGroup');
    const maxOpenCountGroup = this.$('.maxOpenCountGroup');
    const maxHourlyMovingAverageGroup = this.$('.maxHourlyMovingAverageGroup');
    const maxDailyMovingAverageGroup = this.$('.maxDailyMovingAverageGroup');
    const maxMonthlyMovingAverageGroup = this.$('.maxMonthlyMovingAverageGroup');
    expect(lowerFileSizeLimitGroup.find('input.condition-number-input'))
      .to.have.value('1');
    expect(upperFileSizeLimitGroup.find('input.condition-number-input'))
      .to.have.value('2');
    expect(timeGroup.find('input.condition-number-input'))
      .to.have.value('2');
    expect(maxOpenCountGroup.find('input.condition-number-input'))
      .to.have.value('13');
    expect(maxHourlyMovingAverageGroup.find('input.condition-number-input'))
      .to.have.value('14');
    expect(maxDailyMovingAverageGroup.find('input.condition-number-input'))
      .to.have.value('15');
    expect(maxMonthlyMovingAverageGroup.find('input.condition-number-input'))
      .to.have.value('16');
    return wait().then(() => {
      expect(lowerFileSizeLimitGroup.find('.ember-power-select-selected-item'))
        .to.contain('MiB');
      expect(upperFileSizeLimitGroup.find('.ember-power-select-selected-item'))
        .to.contain('MiB');
      expect(timeGroup.find('.ember-power-select-selected-item'))
        .to.contain('Hours');
    });
  });

  [
    'lowerFileSizeLimit',
    'upperFileSizeLimit',
    'minHoursSinceLastOpen',
    'minHoursSinceLastOpen',
    'maxOpenCount',
    'maxHourlyMovingAverage',
    'maxDailyMovingAverage',
    'maxMonthlyMovingAverage',
  ].forEach((fieldName) => {
    it(`does not accept letters in ${fieldName} input`, function (done) {
      this.render(hbs `
          {{space-cleaning-conditions-form
            data=data
            formSendDebounceTime=0
            formSavedInfoHideTimeout=0}}`);

      const group = this.$(`.${fieldName}Group`);
      fillIn(group.find('input.condition-number-input')[0], 'asdf').then(() => {
        expect(group).to.have.class('has-error');
        done();
      });
    });

    it(`does not accept negative numbers in ${fieldName} input`, function (done) {
      this.render(hbs `
                {{space-cleaning-conditions-form
                  data=data
                  formSendDebounceTime=0
                  formSavedInfoHideTimeout=0}}`);

      const group = this.$(`.${fieldName}Group`);
      return fillIn(group.find('input.condition-number-input')[0], '-3').then(() => {
        expect(group).to.have.class('has-error');
        done();
      });
    });

    it(`accepts positive numbers in ${fieldName} input`, function (done) {
      this.render(hbs `
                {{space-cleaning-conditions-form
                  data=data
                  formSendDebounceTime=0
                  formSavedInfoHideTimeout=0}}`);

      const group = this.$(`.${fieldName}Group`);
      fillIn(group.find('input.condition-number-input')[0], '10').then(() => {
        expect(group).not.to.have.class('has-error');
        done();
      });
    });

    it(`sends data after ${fieldName} input focus lost`, function (done) {
      const saveSpy = sinon.spy(() => Promise.resolve());
      this.on('onSave', saveSpy);
      this.render(hbs `
                {{space-cleaning-conditions-form
                  formSendDebounceTime=0
                  formSavedInfoHideTimeout=0
                  data=data
                  onSave=(action "onSave")}}`);

      const saveArg = {};

      if (fieldName.endsWith('FileSizeLimit')) {
        saveArg[fieldName] = { enabled: true, value: 3145728 };
      } else {
        saveArg[fieldName] = { enabled: true, value: 3 };
      }
      const inputSelector = `.${fieldName}Group input.condition-number-input`;
      fillIn(inputSelector, '3').then(() => {
        blur(inputSelector).then(() => {
          expect(saveSpy).to.be.calledOnce;
          expect(saveSpy).to.be.calledWith(saveArg);
          done();
        });
      });
    });
  });

  it('does not accept float numbers in minHoursSinceLastOpen input', function (done) {
    this.render(hbs `
              {{space-cleaning-conditions-form
                data=data
                formSendDebounceTime=0
                formSavedInfoHideTimeout=0}}`);

    const group = this.$('.minHoursSinceLastOpenGroup');
    fillIn(group.find('input.condition-number-input')[0], '3.4').then(() => {
      expect(group).to.have.class('has-error');
      done();
    });
  });

  it('debounce changes save', function (done) {
    const saveSpy = sinon.spy(() => Promise.resolve());
    this.on('onSave', saveSpy);
    this.render(hbs `
              {{space-cleaning-conditions-form
                formSendDebounceTime=0
                formSavedInfoHideTimeout=0
                data=data
                onSave=(action "onSave")}}`);

    const saveArg = {
      lowerFileSizeLimit: { enabled: true, value: 2097152 },
      upperFileSizeLimit: { enabled: true, value: 3145728 },
    };
    const greaterInputSelector =
      '.lowerFileSizeLimitGroup input.condition-number-input';
    const lesserInputSelector =
      '.upperFileSizeLimitGroup input.condition-number-input';
    fillIn(lesserInputSelector, '3').then(() => {
      fillIn(greaterInputSelector, '2').then(() => {
        blur(greaterInputSelector).then(() => {
          expect(saveSpy).to.be.calledOnce;
          expect(saveSpy).to.be.calledWith(saveArg);
          done();
        });
      });
    });
  });
});
