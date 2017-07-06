/**
 * Mixin for space-sync-charts adding data validation capabilities.
 *
 * Usage: implement ``validateSyncChartData`` function.
 * It's result will be available in ``syncChartDataError`` computed property
 * everytime ``timeStats`` property changes.
 *
 * @module mixins/components/space-sync-chart-data-validator
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _ from 'lodash';

import validateTimeStats from 'onepanel-gui/utils/model-validators/validate-time-stats';

const {
  computed,
} = Ember;

export default Ember.Mixin.create({
  init() {
    this._super(...arguments);
  },

  syncChartDataError: computed('timeStats', function () {
    return this.get('timeStats') ?
      this.validateSyncChartData() :
      undefined;
  }),

  /**
   * To implement in subclasses.
   * @returns {string|undefined} description of error if validation failed or nothing
   */
  validateSyncChartData() {},

  /**
   * @param {string[]} metrics
   * @returns {string[]} error messages
   */
  validateAnyMetric(metrics) {
    let timeStats = this.get('timeStats');
    let anyMetric = metrics.some(metric =>
      _.find(timeStats, ts => ts && ts.name === metric) != null
    );
    return anyMetric ? [] : [
      'none of following metrics are available: ' +
      metrics.join(', ')
    ];
  },

  /**
   * @param {string[]} metrics
   * @returns {string[]}
   */
  validateAllMetricsValidOrNull(metrics) {
    let timeStats = this.get('timeStats');
    let errors = [];
    metrics.forEach(metric => {
      let stat = _.find(timeStats, ts => ts && ts.name === metric);
      if (stat) {
        if (!validateTimeStats(stat)) {
          errors.push(`time stats record for "${metric}" is not valid`);
        }
      }
    });
    return errors;
  },

});
