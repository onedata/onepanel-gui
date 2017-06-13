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

  timePeriod: computed('timeStats', function () {
    let {
      timeStats,
    } = this.getProperties('timeStats');
    let len = 0;
    if (timeStats || !timeStats[0].values.length) {
      len = timeStats[0].values.length;
    }
    return len ? 1 / len : 1/12;
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
