import Ember from 'ember';
import _util from 'lodash/util';

import maximizeBarWidth from 'onepanel-gui/utils/chartist/maximize-bar-width';
import barSumLabels from 'onepanel-gui/utils/chartist/bar-sum-labels';
import refreshLegendFilter from 'onepanel-gui/utils/chartist/refresh-legend-filter';
import axisLabels from 'onepanel-gui/utils/chartist/axis-labels';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';
import additionalXLabel from 'onepanel-gui/utils/chartist/additional-x-label';

const {
  computed,
} = Ember;

export default Ember.Component.extend({
  classNames: ['space-sync-chart-operations'],

  /**
   * To inject.
   * @type {Array.Onepanel.TimeStats}
   */
  timeStats: null,

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: {
    stackBars: true,
    chartPadding: 15,
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
        xLabel: 'time',
        yLabel: 'op./s',
      }),
      Chartist.plugins.legend(),
      refreshLegendFilter()
    ]
  },

  /**
   * Series labels for chart
   * @type {Array.string}
   */
  chartLabels: ['Insert', 'Update', 'Delete'],

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
      chartLabels,
    } = this.getProperties('_timeStatsValues', 'chartLabels');
    if (_timeStatsValues && _timeStatsValues.length > 0) {
      return {
        labels: _util.range(_timeStatsValues[1].length).map(n => `${n}:00`),
        series: _timeStatsValues.slice(1).map((values, index) => {
          return {
            name: chartLabels[index],
            data: values,
            className: `ct-series-${index}`
          };
        }),
        // TODO change to some dynamicaly generated value
        lastLabel: '12:00'
      };
    } else {
      return {};
    }
  }),
});
