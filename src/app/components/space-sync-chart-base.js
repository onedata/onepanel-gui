import Ember from 'ember';
import moment from 'moment';
import _ from 'lodash';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['space-sync-chart-base'],

  /**
   * To inject.
   * @type {Array.Onepanel.TimeStats}
   */
  timeStats: null,

  /**
   * To inject.
   * @type {Date}
   */
  lastUpdateTime: new Date(),

  /**
   * To inject.
   * @type {string}
   */
  timeUnit: 'minute',

  emptyTimePeriod: computed('timeParts', function () {
    return _.times(this.get('timeParts'), () => 0);
  }),

  timeParts: computed('timeStats', function () {
    let timeStats = this.get('timeStats');
    let len = 0;
    if (timeStats) {
      let nonEmptyTimeStats = _.find(timeStats, ts =>
        ts && Array.isArray(ts.values) && ts.values.length > 0
      );
      if (nonEmptyTimeStats.values.length) {
        len = nonEmptyTimeStats.values.length;
      }
    }
    return len;
  }),

  timePeriod: computed('timeParts', function () {
    let timeParts = this.get('timeParts');
    return timeParts ? 1 / timeParts : 1 / 12;
  }),

  timeFormat: computed('timeUnit', function () {
    switch (this.get('timeUnit')) {
    case 'hour':
      return 'H:mm';
    case 'day':
      return 'DD/MM H:mm';
    default:
      return 'H:mm:ss';
    }
  }),

  getChartLabel(offset) {
    let {
      lastUpdateTime,
      timeFormat,
      timePeriod,
      timeUnit
    } = this.getProperties(
      'lastUpdateTime',
      'timeFormat',
      'timePeriod',
      'timeUnit');
    return moment(lastUpdateTime)
      .subtract(offset * timePeriod, timeUnit + 's')
      .format(timeFormat);
  }
});
