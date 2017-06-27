/**
 * A chart component for a space import/update throughput statistics.
 *
 * @module components/space-sync-chart-throughput
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _util from 'lodash/util';

import SpaceSyncChartBase from 'onepanel-gui/components/space-sync-chart-base';
import axisLabels from 'onepanel-gui/utils/chartist/axis-labels';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';
import centerLineChart from 'onepanel-gui/utils/chartist/center-line-chart';
import shortHorizontalGrid from 'onepanel-gui/utils/chartist/short-horizontal-grid';

const {
  computed,
} = Ember;

export default SpaceSyncChartBase.extend({
  classNames: ['space-sync-chart-throughput'],

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: {
    stackBars: true,
    chartPadding: 30,
    lineSmooth: Chartist.Interpolation.simple({
    divisor: 2
    }),
    fullWidth: true,
    plugins: [
      tooltip({
        chartType: 'line',
        rangeInTitle: true,
        topOffset: -17,
        valueSuffix: 'op/s'
      }),
      axisLabels({
        xLabel: 'Time',
        yLabel: 'Op/s',
      }),
      shortHorizontalGrid(),
      centerLineChart(),
      Chartist.plugins.legend({
        className: 'not-clickable',
        clickable: false,
      })
    ]
  },

  /**
   * Series labels for chart
   * @type {Array.string}
   */
  chartSeriesLabel: 'Throughput',

  _chartValues: [],

  throughputDivisor: computed('timeUnit', 'timePeriod', function () {
    let {
      timeUnit,
      timePeriod
    } = this.getProperties('timeUnit', 'timePeriod');
    switch (timeUnit) {
      case 'minute':
        return 60 * timePeriod;
      case 'hour':
        return 3600 * timePeriod;
      case 'day':
        return 86400 * timePeriod;
      default:
        return timePeriod;
    }
  }),

  _timeStatsValues: computed('timeStats.@each.values', function () {
    let timeStats = this.get('timeStats');
    return timeStats ? timeStats.map(stat => stat.values) : [];
  }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('_timeStatsValues.[]', 'chartLabel', function () {
    let {
      _timeStatsValues,
      chartSeriesLabel,
      _chartValues,
      throughputDivisor,
    } = this.getProperties('_timeStatsValues', 'chartSeriesLabel', '_chartValues', 'throughputDivisor');
    if (_timeStatsValues && _timeStatsValues.length > 0) {
      while (_chartValues.length) {
        _chartValues.shift();
      }
      _timeStatsValues[1].map((val, index) => 
        _chartValues.push((val + _timeStatsValues[2][index] + _timeStatsValues[3][index]) / throughputDivisor)
      );
      _chartValues.push(null);
      return {
        labels: _util.range(0, _chartValues.length).reverse().map(n => this.getChartLabel(n)),
        series: [{
          name: chartSeriesLabel,
          data: _chartValues,
          className: 'ct-series-0'
        }],
        lastLabel: this.getChartLabel(0)
      };
    } else {
      return {};
    }
  }),
});
