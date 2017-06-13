import Ember from 'ember';
import _util from 'lodash/util';

import SpaceSyncChartBase from 'onepanel-gui/components/space-sync-chart-base';
import axisLabels from 'onepanel-gui/utils/chartist/axis-labels';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';
import additionalXLabel from 'onepanel-gui/utils/chartist/additional-x-label';
import centerLineChart from 'onepanel-gui/utils/chartist/center-line-chart';

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
      additionalXLabel({
        xOffsetMultiply: 0
      }),
      tooltip({
        chartType: 'line',
        rangeInTitle: true,
        topOffset: -20,
      }),
      axisLabels({
        xLabel: 'time',
        yLabel: 'op./s',
      }),
      centerLineChart(),
      Chartist.plugins.legend()
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
    let {
      timeStats,
    } = this.getProperties('timeStats');
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
      console.log(throughputDivisor);
      _timeStatsValues[1].map((val, index) => 
        _chartValues.push((val + _timeStatsValues[2][index] + _timeStatsValues[3][index]) / throughputDivisor)
      );
      _chartValues.push(null);
      return {
        labels: _util.range(1, _chartValues.length).reverse().map(n => this.getChartLabel(n)),
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
