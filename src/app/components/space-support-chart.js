import Ember from 'ember';

// FIXME to use
// import bytesToString from 'onepanel-gui/utils/bytes-to-string';
import tooltip from 'onepanel-gui/utils/chartist/tooltip';

import _ from 'lodash';

const {
  computed,
} = Ember;

// FIXME to use
// const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

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
    return _.map(spaceSupporters, 'size');
  }),

  // FIXME slice labels, slice legend, slice tooltips

  /**
   * Chartist settings
   * @type {Object}
   */
  chartOptions: computed('dataSeries', function () {
    let dataSeries = this.get('dataSeries');
    let total = _.sum(dataSeries);
    return {
      showLabel: false,
      labelInterpolationFnc: (label, index) => {
        return Math.round(100 * dataSeries[index] / total) + '%';
      },
      plugins: [
        // tooltip({
        //   chartType: 'pie',
        // }),
        // Chartist.plugins.legend(),
      ]
    };
  }),

  /**
   * Data for chartist
   * @type {computed.Object}
   */
  chartData: computed('dataLabels', 'dataSeries', function () {
    // let supportingProviders = this.get('supportingProviders');
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
