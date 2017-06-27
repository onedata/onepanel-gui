/**
 * A base component for all space import/update sync statistics charts.
 * Needs timeStats (chart data), lastUpdateTime and timeUnit to be injected.
 *
 * @module components/space-sync-chart-base
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import moment from 'moment';

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

  timePeriod: computed('timeStats', function () {
    let {
      timeStats,
    } = this.getProperties('timeStats');
    let len = 0;
    if (timeStats && timeStats[0].values.length) {
      len = timeStats[0].values.length;
    }
    return len ? 1 / len : 1 / 12;
  }),

  timeFormat: computed('timeUnit', function () {
    switch (this.get('timeUnit')) {
    case 'hour':
      return 'HH:mm';
    case 'day':
      return 'DD/MM HH:mm';
    default:
      return 'HH:mm:ss';
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
    if (timeUnit === 'day') {
      timeUnit = 'hour';
      offset *= 24;
    }
    return moment(lastUpdateTime)
      .subtract(offset * timePeriod, timeUnit + 's')
      .format(timeFormat);
  }
});
