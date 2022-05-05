import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, blur, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import _ from 'lodash';
import { resolve } from 'rsvp';

const globalData = Object.freeze({
  enabled: true,
  minFileSize: { enabled: true, value: 1048576 },
  maxFileSize: { enabled: true, value: 2097152 },
  minHoursSinceLastOpen: { enabled: true, value: 2 },
  maxOpenCount: { enabled: true, value: 13 },
  maxHourlyMovingAverage: { enabled: true, value: 14 },
  maxDailyMovingAverage: { enabled: true, value: 15 },
  maxMonthlyMovingAverage: { enabled: true, value: 16 },
});

describe('Integration | Component | space cleaning conditions form', function () {
  setupRenderingTest();

  beforeEach(function () {
    this.set('data', globalData);
  });

  it('is filled in with injected data', async function () {
    await render(hbs `
      {{space-cleaning-conditions-form
        data=data
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0}}`);
    const minFileSizeGroup = this.$('.minFileSizeGroup');
    const maxFileSizeGroup = this.$('.maxFileSizeGroup');
    const timeGroup = this.$('.minHoursSinceLastOpenGroup');
    const maxOpenCountGroup = this.$('.maxOpenCountGroup');
    const maxHourlyMovingAverageGroup = this.$('.maxHourlyMovingAverageGroup');
    const maxDailyMovingAverageGroup = this.$('.maxDailyMovingAverageGroup');
    const maxMonthlyMovingAverageGroup = this.$('.maxMonthlyMovingAverageGroup');
    expect(minFileSizeGroup.find('input.condition-number-input'))
      .to.have.value('1');
    expect(maxFileSizeGroup.find('input.condition-number-input'))
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
    expect(minFileSizeGroup.find('.ember-power-select-selected-item'))
      .to.contain('MiB');
    expect(maxFileSizeGroup.find('.ember-power-select-selected-item'))
      .to.contain('MiB');
    expect(timeGroup.find('.ember-power-select-selected-item'))
      .to.contain('Hours');
  });

  [
    'minFileSize',
    'maxFileSize',
    'minHoursSinceLastOpen',
    'minHoursSinceLastOpen',
    'maxOpenCount',
    'maxHourlyMovingAverage',
    'maxDailyMovingAverage',
    'maxMonthlyMovingAverage',
  ].forEach((fieldName) => {
    it(`does not accept letters in ${fieldName} input`, async function (done) {
      await render(hbs `
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

    it(`does not accept negative numbers in ${fieldName} input`, async function (done) {
      await render(hbs `
                {{space-cleaning-conditions-form
                  data=data
                  formSendDebounceTime=0
                  formSavedInfoHideTimeout=0}}`);

      const group = this.$(`.${fieldName}Group`);
      return fillIn(group.find('input.condition-number-input')[0], '-3')
        .then(() => {
          expect(group).to.have.class('has-error');
          done();
        });
    });

    it(`accepts positive numbers in ${fieldName} input`, async function (done) {
      await render(hbs `
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

    it(`sends data after ${fieldName} input focus lost`, async function (done) {
      const saveSpy = sinon.spy(() => resolve());
      this.set('onSave', saveSpy);
      await render(hbs `
                {{space-cleaning-conditions-form
                  formSendDebounceTime=0
                  formSavedInfoHideTimeout=0
                  data=data
                  onSave=(action onSave)}}`);

      const saveArg = {};

      if (fieldName.endsWith('FileSize')) {
        saveArg[fieldName] = { value: 3145728 };
      } else {
        saveArg[fieldName] = { value: 3 };
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

  it('does not accept float numbers in minHoursSinceLastOpen input', async function (done) {
    await render(hbs `
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

  it('debounce changes save', async function (done) {
    const saveSpy = sinon.spy(() => resolve());
    this.set('onSave', saveSpy);
    await render(hbs `
              {{space-cleaning-conditions-form
                formSendDebounceTime=0
                formSavedInfoHideTimeout=0
                data=data
                onSave=(action onSave)}}`);

    const saveArg = {
      minFileSize: { value: 2097152 },
      maxFileSize: { value: 3145728 },
    };
    const greaterInputSelector =
      '.minFileSizeGroup input.condition-number-input';
    const lesserInputSelector =
      '.maxFileSizeGroup input.condition-number-input';
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

  it('does not clear number value when disabling and enabling field', async function () {
    const localData = _.cloneDeep(globalData);
    const saveSpy = sinon.spy(data => {
      _.merge(localData, data);
      return resolve();
    });
    this.set('onSave', saveSpy);

    this.set('localData', localData);
    await render(hbs `
              {{space-cleaning-conditions-form
                formSendDebounceTime=0
                formSavedInfoHideTimeout=0
                data=localData
                onSave=(action onSave)}}`);

    const greaterInputSelector =
      '.minFileSizeGroup input.condition-number-input';

    const greaterCheckboxSelector =
      '.minFileSizeGroup .one-checkbox';

    expect(this.$(greaterInputSelector), 'before disable').to.have.value('1');
    return click(greaterCheckboxSelector).then(() => {
      expect(this.$(greaterInputSelector)).to.be.disabled;
      expect(saveSpy).to.be.calledWith({ minFileSize: { enabled: false } });
      return click(greaterCheckboxSelector).then(() => {
        expect(this.$(greaterInputSelector)).to.not.be.disabled;
        expect(saveSpy)
          .to.be.calledWith({ minFileSize: { enabled: true } });
        expect(this.$(greaterInputSelector), 'after enable')
          .to.have.value('1');
      });
    });
  });
});
