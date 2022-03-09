/**
 * Adds providers support visualization data to `cluster-spaces-table-item`
 *
 * @module mixins/components/space-item-supports
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import { resolve, all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Mixin.create(I18n, {
  providerManager: service(),
  i18n: service(),

  currentProviderId: null,
  currentProviderName: null,

  /**
   * Maps: space Id: string -> supported space [b]: number
   * @type {object}
   */
  supportingProviders: reads('space.supportingProviders'),

  /**
   * Each object of array has information about provider space support
   * ```
   * {
   *  providerId: <provider id>
   *  name: <provider name to display>
   *  size: <support size in bytes>
   *  isCurrentProvider: boolean
   * }
   * ```
   * @type {PromiseProxy.Array}
   */
  spaceSupportersProxy: computed('supportingProviders', '_providerDetailsProxy',
    function () {
      let _providerDetailsProxy = this.get('_providerDetailsProxy');
      let supportingProviders = this.get('supportingProviders');
      return PromiseObject.create({
        promise: _providerDetailsProxy
          .then(provider => {
            let id = get(provider, 'id');
            let name = get(provider, 'name');
            return this.createSupportersArray(
              supportingProviders,
              id,
              name
            );
          }),
      });
    }),

  /**
   * Generates name to display of provider based on its Id
   * @param {string} providerId
   * @param {string} currentProviderId
   * @param {string} currentProviderName
   * @return {string} name to display
   */
  providerIdToName(providerId, currentProviderId, currentProviderName) {
    if (providerId === currentProviderId) {
      return resolve(currentProviderName);
    }
    const providerManager = this.get('providerManager');
    return providerManager.getRemoteProvider(providerId)
      .then(result => result.name)
      .catch(() =>
        providerId && `${this.t('supportInfo.provider')}#${providerId.slice(0, 6)}`
      );
  },

  _providerDetailsProxy: null,

  init() {
    this._super(...arguments);
    let providerManager = this.get('providerManager');
    this.set('_providerDetailsProxy', providerManager.getProviderDetailsProxy());
  },

  createSupportersArray(supportingProviders, currentProviderId, currentProviderName) {
    return allFulfilled(_.map(supportingProviders, (size, providerId) =>
      this.providerIdToName(providerId, currentProviderId, currentProviderName).then(
        name => ({
          name,
          size,
          providerId,
          isCurrentProvider: providerId === currentProviderId,
        }))));
  },
});
