/**
 * A chart component for a space import/update operations statistics.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* global Chartist */

import { computed } from '@ember/object';

import _ from 'lodash';

import StorageImportChartBase from 'onepanel-gui/components/storage-import-chart-base';
import maximizeBarWidth from 'onedata-gui-common/utils/chartist/maximize-bar-width';
import barSumLabels from 'onedata-gui-common/utils/chartist/bar-sum-labels';
import refreshLegendFilter from 'onedata-gui-common/utils/chartist/refresh-legend-filter';
import axisLabels from 'onedata-gui-common/utils/chartist/axis-labels';
import tooltip from 'onedata-gui-common/utils/chartist/tooltip';
import additionalXLabel from 'onedata-gui-common/utils/chartist/additional-x-label';
import shortHorizontalGrid from 'onedata-gui-common/utils/chartist/short-horizontal-grid';

export default StorageImportChartBase.extend({
  classNames: ['storage-import-chart-operations'],

  /**
   * @implements StorageImportChartDataValidator
   */
  usedMetrics: Object.freeze(['createdFiles', 'modifiedFiles', 'deletedFiles']),

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: Object.freeze({
    axisY: {
      onlyInteger: true,
    },
    low: 0,
    stackBars: true,
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
        yLabel: 'Files',
      }),
      shortHorizontalGrid(),
      Chartist.plugins.legend(),
      refreshLegendFilter(),
    ],
  }),

  /**
   * Series labels for chart
   * @type {Array.string}
   */
  chartSeriesLabels: Object.freeze(['Created', 'Modified', 'Deleted']),

  _chartValues: Object.freeze([
    [],
    [],
    [],
  ]),

  _timeStatsValues: computed('timeStats.@each.values', function () {
    const {
      timeStats,
    } = this.getProperties('timeStats');
    // if there are falsy TimeStats (e.g. null) we want to fill them with empty data
    // below this.get are used here because we want to lazy-load this computed property
    return timeStats ?
      timeStats.map(stat => (stat && stat.values) || this.get('emptyTimePeriod')) :
      this.get('emptyTimePeriod');
  }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('_timeStatsValues.[]', 'chartLabels', function () {
    const {
      _timeStatsValues,
      chartSeriesLabels,
      _chartValues,
    } = this.getProperties('_timeStatsValues', 'chartSeriesLabels', '_chartValues');
    if (_timeStatsValues && _timeStatsValues.length > 0) {
      const statsValues = _timeStatsValues.slice(1);
      statsValues.forEach((values, index) => {
        while (_chartValues[index].length) {
          _chartValues[index].shift();
        }
        values.forEach(value => _chartValues[index].push(value));
      });
      return {
        labels: _.range(1, _chartValues[0].length + 1)
          .reverse().map(n => this.getChartLabel(n)),
        series: _chartValues.map((values, index) => {
          return {
            name: chartSeriesLabels[index],
            data: _chartValues[index],
            className: `ct-series-${index}`,
          };
        }),
        lastLabel: this.getChartLabel(0),
      };
    } else {
      return {};
    }
  }),

});
