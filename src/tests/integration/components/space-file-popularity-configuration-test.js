import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { fillIn, blur } from 'ember-native-dom-helpers';

describe('Integration | Component | space file popularity configuration', function () {
  setupComponentTest('space-file-popularity-configuration', {
    integration: true,
  });

  it('is filled with injected data', function () {
    this.set('configuration', {
      id: 'space_id',
      enabled: true,
      exampleQuery: 'curl https://example.com',
      lastOpenHourWeight: 2,
      avgOpenCountPerDayWeight: 3,
      maxAvgOpenCountPerDay: 4,
    });

    this.render(hbs `{{space-file-popularity-configuration configuration=configuration}}`);

    const $spaceFilePopularityConfiguration =
      this.$('.space-file-popularity-configuration');

    expect($spaceFilePopularityConfiguration.find('.lastOpenHourWeightGroup input'))
      .to.have.value('2');
    expect(
      $spaceFilePopularityConfiguration
      .find('.avgOpenCountPerDayWeightGroup input')
    ).to.have.value('3');
    expect(
      $spaceFilePopularityConfiguration.find('.maxAvgOpenCountPerDayGroup input')
    ).to.have.value('4');
  });

  it('debounce changes save', function (done) {
    const saveSpy = sinon.spy(() => resolve());
    this.on('onSave', saveSpy);
    this.set('configuration', {
      id: 'space_id',
      enabled: true,
      exampleQuery: 'curl https://example.com',
      lastOpenHourWeight: 2,
      avgOpenCountPerDayWeight: 3,
      maxAvgOpenCountPerDay: 4,
    });
    this.render(hbs `
      {{space-file-popularity-configuration
        configuration=configuration
        onSave=(action "onSave")
        formSendDebounceTime=0
        formSavedInfoHideTimeout=0
      }}
    `);

    const saveArg = {
      lastOpenHourWeight: 3,
    };
    const lastOpenSelector = '.lastOpenHourWeightGroup input';
    fillIn(lastOpenSelector, '3').then(() => {
      blur(lastOpenSelector).then(() => {
        expect(saveSpy).to.be.calledOnce;
        expect(saveSpy).to.be.calledWith(saveArg);
        done();
      });
    });
  });
});
