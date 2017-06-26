/**
 * A chart component for a space import/update operations statistics.
 *
 * @module components/space-sync-chart-operations
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _util from 'lodash/util';

import SpaceSyncChartBase from 'onepanel-gui/components/space-sync-chart-base';
import maximizeBarWidth from 'onepanel-gui/utils/chartist/maximize-bar-width';
import barSumLabels from 'onepanel-gui/utils/chartist/bar-sum-labels';
import refreshLegendFilter from 'onepanel-gui/utils/chartist/refresh-legend-filter';
import axisLabels from 'onepanel-gui/utils/chartist/axis-labels';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';
import additionalXLabel from 'onepanel-gui/utils/chartist/additional-x-label';
import rotateHorizontalLabels from 'onepanel-gui/utils/chartist/rotate-horizontal-labels';
import shortHorizontalGrid from 'onepanel-gui/utils/chartist/short-horizontal-grid';

const {
  computed
} = Ember;

export default SpaceSyncChartBase.extend({
  classNames: ['space-sync-chart-operations'],

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: {
    stackBars: true,
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
        yLabel: 'Files',
      }),
      shortHorizontalGrid(),
      Chartist.plugins.legend(),
      refreshLegendFilter()
    ]
  },

  /**
   * Series labels for chart
   * @type {Array.string}
   */
  chartSeriesLabels: ['Inserted', 'Updated', 'Deleted'],

  _chartValues: [
    [],
    [],
    []
  ],

  _timeStatsValues: computed('timeStats.@each.values', function () {
    let {
      timeStats,
    } = this.getProperties('timeStats');
    return timeStats ? timeStats.map(stat => stat.values) : [];
  }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('_timeStatsValues.[]', 'chartLabels', function () {
    let {
      _timeStatsValues,
      chartSeriesLabels,
      _chartValues,
    } = this.getProperties('_timeStatsValues', 'chartSeriesLabels', '_chartValues');
    if (_timeStatsValues && _timeStatsValues.length > 0) {
      let statsValues = _timeStatsValues.slice(1);
      statsValues.forEach((values, index) => {
        while (_chartValues[index].length) {
          _chartValues[index].shift();
        }
        values.forEach(value => _chartValues[index].push(value));
      });
      return {
        labels: _util.range(1, _chartValues[0].length + 1).reverse().map(n => this.getChartLabel(
          n)),
        series: _chartValues.map((values, index) => {
          return {
            name: chartSeriesLabels[index],
            data: _chartValues[index],
            className: `ct-series-${index}`
          };
        }),
        lastLabel: this.getChartLabel(0)
      };
    } else {
      return {};
    }
  }),
});
