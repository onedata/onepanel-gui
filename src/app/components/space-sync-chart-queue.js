import Ember from 'ember';
import _util from 'lodash/util';

import maximizeBarWidth from 'onepanel-gui/utils/chartist/maximize-bar-width';
import barSumLabels from 'onepanel-gui/utils/chartist/bar-sum-labels';
import axisLabels from 'onepanel-gui/utils/chartist/axis-labels';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';
import additionalXLabel from 'onepanel-gui/utils/chartist/additional-x-label';

const {
  computed,
} = Ember;

export default Ember.Component.extend({
  classNames: ['space-sync-chart-queue'],

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
        yLabel: 'length',
      }),
      Chartist.plugins.legend()
    ]
  },

  /**
   * Label for chart
   * @type {string}
   */
  chartLabel: 'Queue length',

  _queueData: computed('timeStats.[]', function () {
    return this.get('timeStats')[0];
  }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('_queueData.values.[]', 'chartLabel', function () {
    let {
      _queueData,
      chartLabel,
    } = this.getProperties('_queueData', 'chartLabel');
    if (_queueData && _queueData.values.length > 0) {
      return {
        labels: _util.range(_queueData.values.length).map(n => `${n}:00`),
        series: [{
          name: chartLabel,
          data: _queueData.values,
          className: `ct-series-0`
        }],
        // TODO change to some dynamicaly generated value
        lastLabel: '12:00'
      };
    } else {
      return {};
    }
  }),
});
