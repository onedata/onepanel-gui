import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, fillIn, blur, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { resolve } from 'rsvp';

describe('Integration | Component | space-file-popularity-configuration', function () {
  setupRenderingTest();

  it('is filled with injected data', async function () {
    this.set('configuration', {
      id: 'space_id',
      enabled: true,
      exampleQuery: 'curl https://example.com',
      lastOpenHourWeight: 2,
      avgOpenCountPerDayWeight: 3,
      maxAvgOpenCountPerDay: 4,
    });

    await render(hbs `
      {{space-file-popularity-configuration configuration=configuration}}
    `);

    expect(find('.lastOpenHourWeightGroup input')).to.have.value('2');
    expect(find('.avgOpenCountPerDayWeightGroup input')).to.have.value('3');
    expect(find('.maxAvgOpenCountPerDayGroup input')).to.have.value('4');
  });

  it('debounce changes save', async function () {
    const saveSpy = sinon.spy(() => resolve());
    this.set('onSave', saveSpy);
    this.set('configuration', {
      id: 'space_id',
      enabled: true,
      exampleQuery: 'curl https://example.com',
      lastOpenHourWeight: 2,
      avgOpenCountPerDayWeight: 3,
      maxAvgOpenCountPerDay: 4,
    });
    await render(hbs `
      {{space-file-popularity-configuration
        configuration=configuration
        onSave=(action onSave)
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0
      }}
    `);

    const saveArg = {
      lastOpenHourWeight: 3,
    };
    const lastOpenSelector = '.lastOpenHourWeightGroup input';
    await fillIn(lastOpenSelector, '3');
    await blur(lastOpenSelector);
    expect(saveSpy).to.be.calledOnce;
    expect(saveSpy).to.be.calledWith(saveArg);
  });
});
