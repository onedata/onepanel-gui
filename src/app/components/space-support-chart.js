/**
 * Component for displaying a chart that shows distribution of providers support
 * for some space
 *
 * Uses ``spaceSupporters`` property of onepanel.SpaceDetails
 *
 * @module components/space-support-chart
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import generateColors from 'onedata-gui-common/utils/generate-colors';
import validateSupportingProviders from 'onepanel-gui/utils/model-validators/validate-supporting-providers';

const {
  computed,
  A,
} = Ember;

export default Ember.Component.extend({
  classNames: ['chart-component', 'space-support-chart'],

  /**
   * To inject.
   * The same as in ``mixins/components/space-item-support#spaceSupporters``
   * @type {Array.object}
   */
  spaceSupporters: null,

  /**
   * Data for a chart
   * @type computed.Ember.Array.PieChartSeries
   */
  chartData: computed('spaceSupporters', function () {
    let spaceSupporters = this.get('spaceSupporters');
    let colors = generateColors(spaceSupporters.length);
    return A(spaceSupporters.map((supporter, index) => Ember.Object.create({
      id: String(index),
      label: supporter.name,
      value: supporter.size,
      color: colors[index],
    })));
  }),

  /**
   * Data validation error
   * @type {computed.string}
   */
  dataValidationError: computed('spaceSupporters', function () {
    return this.validateChartData(this.get('spaceSupporters'));
  }),

  /**
   * Validates chart data
   * @param {Array.object} spaceSupporters space supporters
   */
  validateChartData(spaceSupporters) {
    return validateSupportingProviders(spaceSupporters) ? undefined :
      `supportingProviders data is invalid`;
  },
});
