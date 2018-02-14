/**
 * A chart component for a space import/update queue length statistics.
 *
 * @module components/space-sync-chart-queue
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

import { computed } from '@ember/object';

import _ from 'lodash';

import SpaceSyncChartBase from 'onepanel-gui/components/space-sync-chart-base';
import maximizeBarWidth from 'onedata-gui-common/utils/chartist/maximize-bar-width';
import barSumLabels from 'onedata-gui-common/utils/chartist/bar-sum-labels';
import axisLabels from 'onedata-gui-common/utils/chartist/axis-labels';
import tooltip from 'onedata-gui-common/utils/chartist/tooltip';
import additionalXLabel from 'onedata-gui-common/utils/chartist/additional-x-label';
import shortHorizontalGrid from 'onedata-gui-common/utils/chartist/short-horizontal-grid';

export default SpaceSyncChartBase.extend({
  classNames: ['space-sync-chart-queue'],

  /**
   * @implements SpaceSyncChartDataValidator
   */
  usedMetrics: Object.freeze(['queueLength']),

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: Object.freeze({
    axisY: {
      onlyInteger: true,
    },
    low: 0,
    chartPadding: 30,
    plugins: [
      maximizeBarWidth(),
      additionalXLabel(),
      barSumLabels(),
      tooltip({
        chartType: 'bar',
        rangeInTitle: true,
        renderAboveBarDescription: true,
      }),
      axisLabels({
        xLabel: 'Time',
        yLabel: 'Length',
      }),
      shortHorizontalGrid(),
      Chartist.plugins.legend({
        className: 'not-clickable',
        clickable: false,
      }),
    ],
  }),

  /**
   * Label for chart
   * @type {string}
   */
  chartSeriesLabel: 'Queue length',

  _queueData: computed('timeStats.[]', function () {
    return _.find(this.get('timeStats'), ts => ts && ts.name === 'queueLength');
  }),

  _chartValues: computed(function () { return []; }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('_queueData.values.[]', 'chartLabel', function () {
    let {
      _queueData,
      chartSeriesLabel,
      _chartValues,
    } = this.getProperties('_queueData', 'chartSeriesLabel', '_chartValues');
    if (_queueData && _queueData.values.length > 0) {
      while (_chartValues.length) {
        _chartValues.shift();
      }
      _queueData.values.forEach(value => _chartValues.push(value));
      return {
        labels: _.range(1, _chartValues.length + 1).reverse()
          .map(n => this.getChartLabel(n)),
        series: [{
          name: chartSeriesLabel,
          data: _chartValues,
          className: 'ct-series-0',
        }],
        lastLabel: this.getChartLabel(0),
      };
    } else {
      return {};
    }
  }),

});
