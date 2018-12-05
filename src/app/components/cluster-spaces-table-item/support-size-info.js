/**
 * A component, that shows information about providers support size per space.
 *
 * @module components/cluster-spaces-table-item/supporte-size-info
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import EmberObject, { computed } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';
import generateColors from 'onedata-gui-common/utils/generate-colors';
import validateSupportingProviders from 'onepanel-gui/utils/model-validators/validate-supporting-providers';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['chart-component', 'space-support-chart'],

  i18nPrefix: 'components.supportSizeInfo',

  i18n: service(),

  /**
   * To inject.
   * The same as in ``mixins/components/space-item-support#spaceSupporters``
   * @type {Array.object}
   */
  spaceSupporters: null,

  /**
   * Data for the support-size-info component
   * @type computed.Ember.Array.PieChartSeries
   */
  _data: computed('spaceSupporters', function () {
    let spaceSupporters = this.get('spaceSupporters');
    let colors = generateColors(spaceSupporters.length);
    return A(spaceSupporters.map((supporter, index) => EmberObject.create({
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
  _dataError: computed('spaceSupporters', function () {
    let {
      spaceSupporters,
      i18n,
    } = this.getProperties('spaceSupporters', 'i18n');
    return validateSupportingProviders(spaceSupporters) ? undefined :
      i18n.t(
        'components.clusterSpacesTableItem.supportInfo.supportingProvidersDataError'
      );
  }),
});
