/**
 * A cluster overview page
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { union, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import I18n from 'onedata-gui-common/mixins/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { tag, promise } from 'ember-awesome-macros';

export default Component.extend(
  I18n,
  createDataProxyMixin('provider'),
  createDataProxyMixin('providerId'),
  createDataProxyMixin('installationDetails'), {
    classNames: ['content-clusters-overview'],

    guiUtils: service(),
    providerManager: service(),
    spaceManager: service(),
    storageManager: service(),
    deploymentManager: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersOverview',

    /**
     * @virtual
     */
    cluster: undefined,

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
     * @type {ComputedProperty<String>}
     */
    providerIdInfoTriggerId: tag `${'elementId'}-provider-id-info-trigger`,

    spacesBatchResolverProxy: promise.object(computed(
      async function spacesBatchResolverProxy() {
        return await this.spaceManager.getSpacesBatchResolver();
      }
    )),

    spacesBatchResolver: reads('spacesBatchResolverProxy.content'),

    /**
     * @type {Ember.ComputedProperty<PromiseArray<SpaceDetails>>}
     */
    spacesProxy: computed('spacesBatchResolverProxy', function spacesProxy() {
      return PromiseArray.create({
        promise: (async () => {
          const spacesBatchResolver = await this.spacesBatchResolverProxy;
          return spacesBatchResolver.promise;
        })(),
      });
    }),

    /**
     * @type {ComputedProperty<PromiseObject<number>>}
     */
    storagesCountProxy: promise.object(computed(async function storagesCountProxy() {
      return (await this.storageManager.getStoragesIds()).length;
    })),

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
      if (this.get('cluster.type') === 'oneprovider') {
        this.updateProviderIdProxy();
      }
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
