/**
 * A cluster overview page
 *
 * @module component/content-clusters-overview
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { union } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(
  I18n,
  createDataProxyMixin('provider'),
  createDataProxyMixin('providerId'),
  createDataProxyMixin('installationDetails'), {
    guiUtils: service(),
    providerManager: service(),
    spaceManager: service(),
    storageManager: service(),
    deploymentManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersOverview',

    // TODO: Uncomment when onezone map will render clusters, that can be accessed
    // instead of only with our spaces
    // /**
    //  * @type {PromiseArray<ProviderDetails>}
    //  */
    // providersProxy: computed('providerProxy', function providersProxy() {
    //   if (this.get('guiUtils.serviceType') === 'oneprovider') {
    //     return PromiseArray.create({
    //       promise: this.get('providerProxy')
    //         .then(provider => [get(provider, 'content')]),
    //     });
    //   }
    // }),

    /**
     * @type {Ember.ComputedProperty<PromiseArray<SpaceDetails>>}
     */
    spacesProxy: computed(function spacesProxy() {
      return PromiseArray.create({
        promise: this.get('spaceManager').getSpaces().then(list =>
          Promise.all(list)
        ),
      });
    }),

    /**
     * @type {Ember.ComputedProperty<PromiseArray<StorageDetails>>}
     */
    storagesProxy: computed(function storagesProxy() {
      return PromiseArray.create({
        promise: this.get('storageManager').getStorages().then(list =>
          get(list, 'content')
        ),
      });
    }),

    /**
     * @type {Ember.ComputedProperty<Array<string>>}
     */
    allNodes: union(
      'installationDetailsProxy.cluster.databases.hosts',
      'installationDetailsProxy.cluster.managers.hosts',
      'installationDetailsProxy.cluster.workers.hosts'
    ),

    init() {
      this._super(...arguments);
      this.updateProviderIdProxy();
      this.updateInstallationDetailsProxy();
    },

    /**
     * @override
     */
    fetchProvider() {
      return this.get('providerManager').getProviderDetailsProxy();
    },

    /**
     * @override
     */
    fetchProviderId() {
      return this.getProviderProxy().then(provider => get(provider, 'id'));
    },

    /**
     * @override
     */
    fetchInstallationDetails() {
      return this.get('deploymentManager').getInstallationDetailsProxy();
    },
  });
