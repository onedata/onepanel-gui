import EmberObject from '@ember/object';
import {
  expect,
} from 'chai';
import {
  describe,
  it,
} from 'mocha';
import ComponentsStorageImportChartDataValidatorMixin from 'onepanel-gui/mixins/components/storage-import-chart-data-validator';

import wait from 'ember-test-helpers/wait';

describe('Unit | Mixin | components/space import chart data validator', function () {
  it('recomputes validation when timeStats changes', function (done) {
    const ComponentsStorageImportChartDataValidatorObject = EmberObject.extend(
      ComponentsStorageImportChartDataValidatorMixin);

    const validateImportChartData = () => {
      return 'hello';
    };

    const subject = ComponentsStorageImportChartDataValidatorObject.create({
      validateImportChartData,
    });

    subject.set('timeStats', []);

    wait().then(() => {
      expect(subject.get('importChartDataError')).to.equal('hello');
      done();
    });

    expect(subject).to.be.ok;
  });

  it('can check if there is at least one required metric', function () {
    const ComponentsStorageImportChartDataValidatorObject = EmberObject.extend(
      ComponentsStorageImportChartDataValidatorMixin
    );
    const subject = ComponentsStorageImportChartDataValidatorObject.create({
      timeStats: [{
        name: 'one',
        lastValueDate: new Date().toJSON(),
        values: [],
      }],
    });

    const errors = subject.validateAnyMetric(['one', 'two', 'three']);

    expect(errors).to.be.empty;
  });

  it('can check if there is lack of at least one required metric', function () {
    const ComponentsStorageImportChartDataValidatorObject = EmberObject.extend(
      ComponentsStorageImportChartDataValidatorMixin
    );
    const subject = ComponentsStorageImportChartDataValidatorObject.create({
      timeStats: [{
        name: 'seven',
        lastValueDate: new Date().toJSON(),
        values: [],
      }],
    });

    const errors = subject.validateAnyMetric(['one', 'two', 'three']);

    expect(errors).to.not.be.empty;
  });

  it('can check if there is at least one required metric', function () {
    const ComponentsStorageImportChartDataValidatorObject = EmberObject.extend(
      ComponentsStorageImportChartDataValidatorMixin
    );
    const subject = ComponentsStorageImportChartDataValidatorObject.create({
      timeStats: [{
        name: 'one',
        lastValueDate: new Date().toJSON(),
        values: [],
      }],
    });

    const errors = subject.validateAllMetricsValidOrNull(['one']);

    expect(errors).to.be.empty;
  });
});
