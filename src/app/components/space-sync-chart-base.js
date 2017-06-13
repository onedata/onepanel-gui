import Ember from 'ember';
import moment from 'moment';

const {
  computed
} = Ember;

export default Ember.Component.extend({
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

  lowerTimeUnit: computed('timeUnit', function () {
    switch (this.get('timeUnit')) {
    case 'minute':
      return 'second';
    case 'hour':
      return 'minute';
    case 'day':
      return 'hour';
    default:
      return 'second';
    }
  }),

  /**
   * To inject.
   * @type {number}
   * @abstract
   */
  timePeriod: computed('timeStats', 'timeUnit', function () {
    let {
      timeStats,
      timeUnit,
    } = this.getProperties('timeStats', 'timeUnit');
    let len = 0;
    if (timeStats || !timeStats[0].values.length) {
      len = !timeStats[0].values.length;
    }
    switch (timeUnit) {
    case 'minute':
    case 'hour':
      return len ? 60 / len : 5;
    case 'day':
      return len ? 24 / len : 2;
    default:
      return 'H:mm:ss';
    }
  }),

  timeFormat: computed('timeUnit', function () {
    switch (this.get('timeUnit')) {
    case 'minute':
      return 'H:mm:ss';
    case 'hour':
      return 'H:mm';
    case 'day':
      return 'DD/MM';
    default:
      return 'H:mm:ss';
    }
  }),

  getChartLabel(offset) {
    let {
      lastUpdateTime,
      timeFormat,
      timePeriod,
      lowerTimeUnit
    } = this.getProperties(
      'lastUpdateTime',
      'timeFormat',
      'timePeriod',
      'lowerTimeUnit');
    return moment(lastUpdateTime)
      .subtract(offset * timePeriod, lowerTimeUnit + 's')
      .format(timeFormat);
  }
});
