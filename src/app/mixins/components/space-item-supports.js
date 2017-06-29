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
  get,
} = Ember;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

/**
 * Generates name to display of provider based on its Id
 * @param {string} providerId
 * @return {string} name to display
 */
function providerIdToName(providerId) {
  return providerId && `Provider#${providerId.slice(0, 6)}`;
}

export default Mixin.create({
  providerManager: service(),

  currentProviderId: null,
  currentProviderName: null,

  /**
   * Maps: space Id: string -> supported space [b]: number
   * @type {object}
   */
  supportingProviders: readOnly('space.supportingProviders'),

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
  spaceSupportersProxy: computed('supportingProviders', '_providerDetailsProxy',
    function () {
      let _providerDetailsProxy = this.get('_providerDetailsProxy');
      let supportingProviders = this.get('supportingProviders');
      return ObjectPromiseProxy.create({
        promise: new Promise((resolve, reject) => {
          _providerDetailsProxy.get('promise').then(provider => {
            let id = get(provider, 'id');
            let name = get(provider, 'name');
            resolve(this.createSupportersArray(
              supportingProviders,
              id,
              name
            ));
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

  createSupportersArray(supportingProviders, currentProviderId, currentProviderName) {
    return _.map(supportingProviders, (size, pid) => ({
      name: pid === currentProviderId ?
        currentProviderName : providerIdToName(pid),
      size
    }));
  },
});
