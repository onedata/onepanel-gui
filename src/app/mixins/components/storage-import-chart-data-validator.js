/**
 * Mixin for storage-import-charts adding data validation capabilities.
 *
 * Usage: implement ``validateImportChartData`` function.
 * It's result will be available in ``importChartDataError`` computed property
 * everytime ``timeStats`` property changes.
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import _ from 'lodash';

import validateTimeStats from 'onepanel-gui/utils/model-validators/validate-time-stats';

export default Mixin.create({
  /**
   * To implement in subclasses.
   * Should contain metric names that are used by chart.
   * At least one metric from this collection is required for chart to render.
   * @type {string[]}
   */
  usedMetrics: Object.freeze([]),

  importChartDataError: computed('timeStats', function () {
    return this.get('timeStats') ?
      this.validateImportChartData() :
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
  validateImportChartData() {
    const usedMetrics = this.get('usedMetrics');
    const errors = _.concat(
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
    const timeStats = this.get('timeStats');
    const anyMetric = metrics.some(metric =>
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
    const timeStats = this.get('timeStats');
    const errors = [];
    metrics.forEach(metric => {
      const stat = _.find(timeStats, ts => ts && ts.name === metric);
      if (stat) {
        if (!validateTimeStats(stat)) {
          errors.push(`time stats record for "${metric}" is not valid`);
        }
      }
    });
    return errors;
  },

});
