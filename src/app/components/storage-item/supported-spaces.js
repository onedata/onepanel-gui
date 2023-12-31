/**
 * List of spaces supported by some storage with support sizes
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import EmberObject, { get, computed } from '@ember/object';
import { A } from '@ember/array';
import ColorGenerator from 'onedata-gui-common/utils/color-generator';

export default Component.extend({
  classNames: ['storage-item-supported-spaces'],

  providerManager: service(),

  /**
   * To inject.
   * Id of storage details
   * @type {String}
   */
  storageId: null,

  /**
   * To inject.
   * List of spaces, can be full list of spaces or only supported by the storage
   * @type {Array<Onepanel.SpaceDetails>}
   */
  spaces: null,

  /**
   * @type {ComputedProperty<Utils.ColorGenerator>}
   */
  colorGenerator: computed(() => new ColorGenerator()),

  /**
   * Id of provider for this onepanel
   * Used for checking what support is local
   * @type {String}
   */
  providerId: reads('providerManager.providerDetails.id'),

  /**
   * List of spaces supported by this storage (filtered list of spaces)
   * @type {Array.Onepanel.SpaceDetails}
   */
  supportedSpaces: computed('spaces', function () {
    const storageId = this.storageId;
    return this.spaces.filter(space => {
      // if there will be more than one local storage per space,
      // localStorages array can be used instead of storageId
      const localStorageId = get(space, 'storageId');
      return localStorageId && localStorageId === storageId;
    });
  }),

  /**
   * Data for support-size-info component
   * @type computed.Ember.Array.PieChartSeries
   */
  chartData: computed(
    'supportedSpaces',
    'providerId',
    'colorGenerator',
    function chartData() {
      const {
        supportedSpaces,
        providerId,
        colorGenerator,
      } = this.getProperties('supportedSpaces', 'providerId', 'colorGenerator');
      if (providerId && supportedSpaces.length) {
        return A(supportedSpaces.map((space, index) => EmberObject.create({
          id: String(index),
          spaceId: get(space, 'id'),
          label: get(space, 'name'),
          value: get(space, `supportingProviders.${providerId}`),
          color: colorGenerator.generateColorForKey(get(space, 'id')),
        })));
      } else {
        return A();
      }
    }
  ),

  init() {
    this._super(...arguments);

    if (this.get('providerId') == null) {
      // force getProviderDetailsProxy to be invoked
      this.get('providerManager').getProviderDetailsProxy();
    }
  },
});
