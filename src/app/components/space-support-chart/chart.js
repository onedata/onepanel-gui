/**
 * Internal component for displaying a chart that shows distribution of providers support
 * for some space
 *
 * @module components/space-support-chart/chart
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnePieChart from 'onedata-gui-common/components/one-pie-chart';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

export default OnePieChart.extend({
  /**
   * @implements
   */
  formatValue(value) {
    return bytesToString(value, { iecFormat: true });
  },

  /**
   * @implements
   */
  generateChartDataSeries() {
    let _sortedData = this.get('_sortedData');
    let chartDataSeries = this._super(...arguments);
    chartDataSeries.forEach((series, index) => {
      series.tooltipElements = [{
        name: 'Support size',
        value: this.formatValue(_sortedData[index].value),
      }, {
        name: 'Support share',
        value: Math.round(
          this.getSeriesPercentSize(_sortedData[index]) * 100
        ) + '%',
      }];
    });
    return chartDataSeries;
  },
});
