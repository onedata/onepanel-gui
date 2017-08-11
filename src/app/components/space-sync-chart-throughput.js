/**
 * A chart component for a space import/update throughput statistics.
 *
 * @module components/space-sync-chart-throughput
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

import Ember from 'ember';
import _ from 'lodash';

import SpaceSyncChartBase from 'onepanel-gui/components/space-sync-chart-base';
import axisLabels from 'onedata-gui-common/utils/chartist/axis-labels';
import tooltip from 'onedata-gui-common/utils/chartist/tooltip';
import centerLineChart from 'onedata-gui-common/utils/chartist/center-line-chart';
import shortHorizontalGrid from 'onedata-gui-common/utils/chartist/short-horizontal-grid';

const {
  computed,
} = Ember;

export default SpaceSyncChartBase.extend({
  classNames: ['space-sync-chart-throughput'],

  /**
   * @implements SpaceSyncChartDataValidator
   */
  usedMetrics: ['insertCount', 'updateCount', 'deleteCount'],

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: {
    axisY: {
      onlyInteger: true,
    },
    low: 0,
    chartPadding: 30,
    lineSmooth: Chartist.Interpolation.simple({
      divisor: 2,
    }),
    fullWidth: true,
    plugins: [
      tooltip({
        chartType: 'line',
        rangeInTitle: true,
        topOffset: -17,
        valueSuffix: 'op/s',
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
      }),
    ],
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
      timePeriod,
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
    // stat or stat.values can be null in case when there are no deletes or updates
    return timeStats ? timeStats.map(stat => stat && stat.values ||
      this.get('emptyTimePeriod')) : [];
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
    } = this.getProperties('_timeStatsValues', 'chartSeriesLabel', '_chartValues',
      'throughputDivisor');
    if (_timeStatsValues && _timeStatsValues.length > 0) {
      while (_chartValues.length) {
        _chartValues.shift();
      }
      _timeStatsValues[1].map((val, index) =>
        _chartValues.push(
          (val + _timeStatsValues[2][index] + _timeStatsValues[3][index]) /
          throughputDivisor
        )
      );
      _chartValues.push(null);
      return {
        labels: _.range(0, _chartValues.length).reverse().map(n =>
          this.getChartLabel(n)
        ),
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
