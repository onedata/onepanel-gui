import {
  expect
} from 'chai';
import {
  describe,
  it
} from 'mocha';
import Ember from 'ember';
import ComponentsSpaceSyncChartDataValidatorMixin from 'onepanel-gui/mixins/components/space-sync-chart-data-validator';

import wait from 'ember-test-helpers/wait';

describe('Unit | Mixin | components/space sync chart data validator', function () {
  it('recomputes validation when timeStats changes', function (done) {
    let ComponentsSpaceSyncChartDataValidatorObject = Ember.Object.extend(
      ComponentsSpaceSyncChartDataValidatorMixin);

    let validateSyncChartData = () => {
      return 'hello';
    };

    let subject = ComponentsSpaceSyncChartDataValidatorObject.create({
      validateSyncChartData,
    });

    subject.set('timeStats', []);

    wait().then(() => {
      expect(subject.get('syncChartDataError')).to.equal('hello');
      done();
    });

    expect(subject).to.be.ok;
  });

  it('can check if there is at least one required metric', function () {
    let ComponentsSpaceSyncChartDataValidatorObject = Ember.Object.extend(
      ComponentsSpaceSyncChartDataValidatorMixin
    );
    let subject = ComponentsSpaceSyncChartDataValidatorObject.create({
      timeStats: [{
        name: 'one',
        lastValueDate: new Date().toJSON(),
        values: [],
      }],
    });

    let errors = subject.validateAnyMetric(['one', 'two', 'three']);

    expect(errors).to.be.empty;
  });

  it('can check if there is lack of at least one required metric', function () {
    let ComponentsSpaceSyncChartDataValidatorObject = Ember.Object.extend(
      ComponentsSpaceSyncChartDataValidatorMixin
    );
    let subject = ComponentsSpaceSyncChartDataValidatorObject.create({
      timeStats: [{
        name: 'seven',
        lastValueDate: new Date().toJSON(),
        values: [],
      }],
    });

    let errors = subject.validateAnyMetric(['one', 'two', 'three']);

    expect(errors).to.not.be.empty;
  });

  it('can check if there is at least one required metric', function () {
    let ComponentsSpaceSyncChartDataValidatorObject = Ember.Object.extend(
      ComponentsSpaceSyncChartDataValidatorMixin
    );
    let subject = ComponentsSpaceSyncChartDataValidatorObject.create({
      timeStats: [{
        name: 'one',
        lastValueDate: new Date().toJSON(),
        values: [],
      }],
    });

    let errors = subject.validateAllMetricsValidOrNull(['one']);

    expect(errors).to.be.empty;
  });
});
