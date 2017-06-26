/**
 * A chart component for a space import/update queue length statistics.
 *
 * @module components/space-sync-chart-queue
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _util from 'lodash/util';

import SpaceSyncChartBase from 'onepanel-gui/components/space-sync-chart-base';
import maximizeBarWidth from 'onepanel-gui/utils/chartist/maximize-bar-width';
import barSumLabels from 'onepanel-gui/utils/chartist/bar-sum-labels';
import axisLabels from 'onepanel-gui/utils/chartist/axis-labels';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';
import additionalXLabel from 'onepanel-gui/utils/chartist/additional-x-label';
import rotateHorizontalLabels from 'onepanel-gui/utils/chartist/rotate-horizontal-labels';
import shortHorizontalGrid from 'onepanel-gui/utils/chartist/short-horizontal-grid';

const {
  computed,
} = Ember;

export default SpaceSyncChartBase.extend({
  classNames: ['space-sync-chart-queue'],

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: {
    chartPadding: 30,
    plugins: [
      maximizeBarWidth(),
      additionalXLabel(),
      rotateHorizontalLabels(),
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
      })
    ]
  },

  /**
   * Label for chart
   * @type {string}
   */
  chartSeriesLabel: 'Queue length',

  _queueData: computed('timeStats.[]', function () {
    return this.get('timeStats')[0];
  }),

  _chartValues: [],

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
        labels: _util.range(1, _chartValues.length + 1).reverse().
          map(n => this.getChartLabel(n)),
        series: [{
          name: chartSeriesLabel,
          data: _chartValues,
          className: `ct-series-0`
        }],
        lastLabel: this.getChartLabel(0)
      };
    } else {
      return {};
    }
  }),
});
