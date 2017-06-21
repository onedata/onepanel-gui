import Ember from 'ember';

import bytesToString from 'onepanel-gui/utils/bytes-to-string';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';

import _ from 'lodash';

const {
  computed,
} = Ember;

const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

export default Ember.Component.extend({
  classNames: ['chart-component', 'space-support-chart'],

  /**
   * To inject.
   * The same as in ``mixins/components/space-item-support#spaceSupporters``
   * @type {Array.object}
   */
  spaceSupporters: null,

  dataLabels: computed('spaceSupporters', function () {
    let spaceSupporters = this.get('spaceSupporters');
    return _.map(spaceSupporters, 'name');
  }),

  dataSeries: computed('spaceSupporters', function () {
    let spaceSupporters = this.get('spaceSupporters');
    let total = _.sum(_.map(spaceSupporters, 'size'));
    return spaceSupporters.map((entry, index) => ({
      data: entry.size,
      className: `ct-series-${index}`,
      tooltipElements: [{
          name: 'Support size',
          value: b2s(entry.size)
        },
        {
          name: 'Support share',
          value: Math.round(100 * entry.size / total) + '%',
        }
      ]
    }));
  }),

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: computed('dataSeries', function () {
    return {
      showLabel: false,
      plugins: [
        tooltip({
          chartType: 'pie',
        }),
        Chartist.plugins.legend({
          className: 'not-clickable',
          clickable: false,
        }),
      ]
    };
  }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('dataLabels', 'dataSeries', function () {
    let {
      dataLabels,
      dataSeries,
    } = this.getProperties(
      'dataLabels',
      'dataSeries'
    );
    return {
      labels: dataLabels,
      series: dataSeries,
    };
  }),

  init() {
    this._super(...arguments);
  },
});
