/**
 * List of spaces supported by some storage with support sizes
 *
 * @module components/storage-item/supported-spaces
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import generateColors from 'onedata-gui-common/utils/generate-colors';

const {
  computed,
  computed: { oneWay },
  inject: { service },
  get,
  A,
} = Ember;

export default Ember.Component.extend({
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
   * @type {Array.Onepanel.SpaceDetails}
   */
  spaces: null,

  /**
   * Id of provider for this onepanel
   * Used for checking what support is local
   * @type {String}
   */
  providerId: oneWay('providerManager.providerCache.id'),

  /**
   * List of spaces supported by this storage (filtered list of spaces)
   * @type {Array.Onepanel.SpaceDetails}
   */
  supportedSpaces: computed('spaces.@each.isFulfilled', function () {
    let {
      spaces,
      storageId,
    } = this.getProperties('spaces', 'storageId');

    return spaces.filter(spaceProxy => {
      if (spaceProxy.get('isFulfilled')) {
        // if there will be more than one local storage per space, 
        // localStorages array can be used instead of storageId
        let localStorage = spaceProxy.get('content.storageId');
        return localStorage && localStorage === storageId;
      } else {
        return false;
      }
    });
  }),

  /**
   * Data for support-size-info component
   * @type computed.Ember.Array.PieChartSeries
   */
  chartData: computed('supportedSpaces', 'providerId', function () {
    let {
      supportedSpaces,
      providerId,
    } = this.getProperties('supportedSpaces', 'providerId');
    let colors = generateColors(supportedSpaces.length);
    if (providerId && supportedSpaces.length) {
      return A(supportedSpaces.map((space, index) => Ember.Object.create({
        id: String(index),
        label: get(space, 'name'),
        value: get(space, `supportingProviders.${providerId}`),
        color: colors[index],
      })));
    } else {
      return A();
    }
  }),

  init() {
    this._super(...arguments);

    if (this.get('providerId') == null) {
      // force getProviderDetails to be invoked
      this.get('providerManager').getProviderDetails();
    }
  },
});
