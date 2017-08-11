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
  isEmpty,
} = Ember;

export default Ember.Mixin.create({
  /**
   * To implement in subclasses.
   * Should contain metric names that are used by chart.
   * At least one metric from this collection is required for chart to render.
   * @type {string[]}
   */
  usedMetrics: [],

  syncChartDataError: computed('timeStats', function () {
    return this.get('timeStats') ?
      this.validateSyncChartData() :
      undefined;
  }),

  /**
   * Default implementation of validation
   *
   * Checking if there are enough metric objects to populate a chart and if
   * they are valid.
   *
   * @returns {string|undefined} description of error if validation failed or nothing
   */
  validateSyncChartData() {
    let usedMetrics = this.get('usedMetrics');
    let errors = _.concat(
      this.validateAnyMetric(usedMetrics),
      this.validateAllMetricsValidOrNull(usedMetrics)
    );
    return isEmpty(errors) ? undefined : errors.join('; ');
  },

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
      'none of following metrics is available: ' +
      metrics.join(', '),
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
