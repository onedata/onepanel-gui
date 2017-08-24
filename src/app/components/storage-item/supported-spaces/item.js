/**
 * Single supported space entry for storage in supported-spaces list
 *
 * Used internally by `storage-item/supported-spaces` component
 *
 * @module 
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

const {
  inject: { service },
  computed,
  get,
} = Ember;

const b2s = (bytes) => bytesToString(bytes, { iecFormat: true });

export default Ember.Component.extend({
  classNames: ['row', 'content-row', 'nested-row', 'storage-item-supported-space-item'],

  providerManager: service(),

  /**
   * To inject.
   * @type {SpaceDetails}
   */
  space: null,

  /**
   * To inject.
   * @type {string}
   */
  providerId: null,

  supportSize: computed('space.supportingProviders', 'providerId', function () {
    let providerId = this.get('providerId');
    if (providerId != null) {
      return get(this.get('space.supportingProviders'), providerId);
    }
  }),

  supportSizeHuman: computed('supportSize', function () {
    return b2s(this.get('supportSize'));
  }),

});
