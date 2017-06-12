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

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('timeStats.@each.values.[]', 'chartLabels', function () {
    let {
      timeStats,
      chartLabels,
    } = this.getProperties('timeStats', 'chartLabels');
    if (timeStats) {
      return {
        labels: _util.range(timeStats[1].values.length).map(n => `${n}:00`),
        series: timeStats.slice(1).map((stat, index) => {
          return {
            name: chartLabels[index],
            data: stat.values,
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
