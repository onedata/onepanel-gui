import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, blur, click, find } from '@ember/test-helpers';
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
    await render(hbs `{{space-cleaning-conditions-form
      data=data
      formSendDebounceTime=0
      formSavedInfoHideTimeout=0
    }}`);

    const minFileSizeGroup = find('.minFileSizeGroup');
    const maxFileSizeGroup = find('.maxFileSizeGroup');
    const timeGroup = find('.minHoursSinceLastOpenGroup');
    const maxOpenCountGroup = find('.maxOpenCountGroup');
    const maxHourlyMovingAverageGroup = find('.maxHourlyMovingAverageGroup');
    const maxDailyMovingAverageGroup = find('.maxDailyMovingAverageGroup');
    const maxMonthlyMovingAverageGroup = find('.maxMonthlyMovingAverageGroup');
    expect(minFileSizeGroup.querySelector('input.condition-number-input'))
      .to.have.value('1');
    expect(maxFileSizeGroup.querySelector('input.condition-number-input'))
      .to.have.value('2');
    expect(timeGroup.querySelector('input.condition-number-input'))
      .to.have.value('2');
    expect(maxOpenCountGroup.querySelector('input.condition-number-input'))
      .to.have.value('13');
    expect(maxHourlyMovingAverageGroup.querySelector('input.condition-number-input'))
      .to.have.value('14');
    expect(maxDailyMovingAverageGroup.querySelector('input.condition-number-input'))
      .to.have.value('15');
    expect(maxMonthlyMovingAverageGroup.querySelector('input.condition-number-input'))
      .to.have.value('16');
    expect(minFileSizeGroup.querySelector('.ember-power-select-selected-item'))
      .to.contain.text('MiB');
    expect(maxFileSizeGroup.querySelector('.ember-power-select-selected-item'))
      .to.contain.text('MiB');
    expect(timeGroup.querySelector('.ember-power-select-selected-item'))
      .to.contain.text('Hours');
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
    it(`does not accept letters in ${fieldName} input`, async function () {
      await render(hbs `{{space-cleaning-conditions-form
        data=data
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0
      }}`);

      const group = find(`.${fieldName}Group`);
      await fillIn(group.querySelector('input.condition-number-input'), 'asdf');
      expect(group).to.have.class('has-error');
    });

    it(`does not accept negative numbers in ${fieldName} input`, async function () {
      await render(hbs `{{space-cleaning-conditions-form
        data=data
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0
      }}`);

      const group = find(`.${fieldName}Group`);
      await fillIn(group.querySelector('input.condition-number-input'), '-3');
      expect(group).to.have.class('has-error');
    });

    it(`accepts positive numbers in ${fieldName} input`, async function () {
      await render(hbs `{{space-cleaning-conditions-form
        data=data
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0
      }}`);

      const group = find(`.${fieldName}Group`);
      await fillIn(group.querySelector('input.condition-number-input'), '10');
      expect(group).not.to.have.class('has-error');
    });

    it(`sends data after ${fieldName} input focus lost`, async function () {
      const saveSpy = sinon.spy(() => resolve());
      this.set('onSave', saveSpy);
      await render(hbs `{{space-cleaning-conditions-form
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0
        data=data
        onSave=(action onSave)
      }}`);

      const saveArg = {};

      if (fieldName.endsWith('FileSize')) {
        saveArg[fieldName] = { value: 3145728 };
      } else {
        saveArg[fieldName] = { value: 3 };
      }
      const inputSelector = `.${fieldName}Group input.condition-number-input`;
      await fillIn(inputSelector, '3');
      await blur(inputSelector);
      expect(saveSpy).to.be.calledOnce;
      expect(saveSpy).to.be.calledWith(saveArg);
    });
  });

  it('does not accept float numbers in minHoursSinceLastOpen input', async function () {
    await render(hbs `{{space-cleaning-conditions-form
      data=data
      formSendDebounceTime=0
      formSavedInfoHideTimeout=0
    }}`);

    const group = find('.minHoursSinceLastOpenGroup');
    await fillIn(group.querySelector('input.condition-number-input'), '3.4');
    expect(group).to.have.class('has-error');
  });

  it('debounce changes save', async function () {
    const saveSpy = sinon.spy(() => resolve());
    this.set('onSave', saveSpy);
    await render(hbs `{{space-cleaning-conditions-form
      formSendDebounceTime=0
      formSavedInfoHideTimeout=0
      data=data
      onSave=(action onSave)
    }}`);

    const saveArg = {
      minFileSize: { value: 2097152 },
      maxFileSize: { value: 3145728 },
    };
    const greaterInputSelector =
      '.minFileSizeGroup input.condition-number-input';
    const lesserInputSelector =
      '.maxFileSizeGroup input.condition-number-input';
    await fillIn(lesserInputSelector, '3');
    await fillIn(greaterInputSelector, '2');
    await blur(greaterInputSelector);
    expect(saveSpy).to.be.calledOnce;
    expect(saveSpy).to.be.calledWith(saveArg);
  });

  it('does not clear number value when disabling and enabling field', async function () {
    const localData = _.cloneDeep(globalData);
    const saveSpy = sinon.spy(data => {
      _.merge(localData, data);
      return resolve();
    });
    this.set('onSave', saveSpy);

    this.set('localData', localData);
    await render(hbs `{{space-cleaning-conditions-form
      formSendDebounceTime=0
      formSavedInfoHideTimeout=0
      data=localData
      onSave=(action onSave)
    }}`);

    const greaterInputSelector =
      '.minFileSizeGroup input.condition-number-input';

    const greaterCheckboxSelector =
      '.minFileSizeGroup .one-checkbox';

    expect(find(greaterInputSelector), 'before disable').to.have.value('1');
    await click(greaterCheckboxSelector);
    expect(find(greaterInputSelector)).to.have.attr('disabled');
    expect(saveSpy).to.be.calledWith({ minFileSize: { enabled: false } });
    await click(greaterCheckboxSelector);
    expect(find(greaterInputSelector)).to.not.have.attr('disabled');
    expect(saveSpy)
      .to.be.calledWith({ minFileSize: { enabled: true } });
    expect(find(greaterInputSelector), 'after enable')
      .to.have.value('1');
  });
});
