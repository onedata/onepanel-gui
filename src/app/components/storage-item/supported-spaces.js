/**
 * List of spaces supported by some storage with support sizes
 *
 * @module components/storage-item/supported-spaces
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import _ from 'lodash';

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

const {
  computed,
  computed: { oneWay },
  inject: { service },
  get,
} = Ember;

export default Ember.Component.extend({
  classNames: ['row', 'content-row', 'storage-item-supported-spaces'],

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
   * Total size of support provided to spaces in supportedSpaces list in bytes
   * @type {computed.Number}
   */
  supportTotalSize: computed('supportedSpaces.@each.supportingProviders', 'providerId',
    function () {
      let {
        providerId,
        supportedSpaces,
      } = this.getProperties('providerId', 'supportedSpaces');

      if (providerId != null) {
        return _.sum(_.map(supportedSpaces, s =>
          // space size of support in this provider
          get(s, `supportingProviders.${providerId}`)
        ));
      }
    }),

  /**
   * Humand-readable total size of support
   * @type {computed.String}
   */
  supportTotalSizeHuman: computed('supportTotalSize', function () {
    return b2s(this.get('supportTotalSize'));
  }),

  init() {
    this._super(...arguments);

    if (this.get('providerId') == null) {
      // force getProviderDetails to be invoked
      this.get('providerManager').getProviderDetails();
    }
  },
});
