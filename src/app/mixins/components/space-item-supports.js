/**
 * Adds providers support visualization data to ``cluster-spaces-table-item``
 *
 * @module mixins/space-item-supports
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _ from 'lodash';

const {
  Mixin,
  computed,
  computed: { readOnly },
  inject: { service },
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

/**
 * Generates name to display of provider based on its Id
 * @param {string} providerId
 * @return {string} name to display
 */
function providerIdToName(providerId) {
  return providerId && `ID-${providerId.slice(0, 6)}`;
}

export default Mixin.create({
  providerManager: service(),

  currentProviderId: null,
  currentProviderName: null,

  /**
   * Maps: space Id: string -> supported space [b]: number
   * @type {object}
   */
  providersSupport: readOnly('space.providersSupport'),

  /**
   * Each object of array has information about provider space support
   * ```
   * {
   *  providerId: <provider id>
   *  name: <provider name to display>
   *  size: <support size in bytes>
   * }
   * ```
   * @type {PromiseProxy.Array}
   */
  spaceSupportersProxy: computed('providersSupport', '_providerDetailsProxy', function () {
    let _providerDetailsProxy = this.get('_providerDetailsProxy');
    let providersSupport = this.get('providersSupport');
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve, reject) => {
        _providerDetailsProxy.get('promise').then(({ id, name }) => {
          resolve(this.createSupportersArray(providersSupport, id, name));
        });
        _providerDetailsProxy.catch(reject);
      })
    });
  }),

  _providerDetailsProxy: null,

  init() {
    this._super(...arguments);
    let providerManager = this.get('providerManager');
    this.set('_providerDetailsProxy', providerManager.getProviderDetails());
  },

  createSupportersArray(providersSupport, currentProviderId, currentProviderName) {
    return _.map(providersSupport, (size, pid) => ({
      name: pid === currentProviderId ?
        currentProviderName : providerIdToName(pid),
      size
    }));
  },
});
