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
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  guiUtils: service(),
  providerManager: service(),
  spaceManager: service(),
  storageManager: service(),
  configurationManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersOverview',

  /**
   * @type {PromiseObject<ProviderDetails>}
   */
  providerProxy: computed(function providerProxy() {
    return this.get('providerManager').getProviderDetails();
  }),

  /**
   * @type {PromiseArray<ProviderDetails>}
   */
  providersProxy: computed('providerProxy', function providersProxy() {
    if (this.get('guiUtils.serviceType') === 'oneprovider') {
      return PromiseArray.create({
        promise: this.get('providerProxy')
          .then(provider => [get(provider, 'content')]),
      });
    }
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<ProviderDetails>>}
   */
  providerIdProxy: computed('providerProxy', function providerIdProxy() {
    return PromiseObject.create({
      promise: this.get('providerProxy').then(provider => get(provider,
        'content.id')),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<SpaceDetails>>}
   */
  spacesProxy: computed(function spacesProxy() {
    return PromiseArray.create({
      promise: this.get('spaceManager').getSpaces().then(l => Promise.all(l)),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseArray<StorageDetails>>}
   */
  storagesProxy: computed(function storagesProxy() {
    return PromiseArray.create({
      promise: this.get('storageManager').getStorages().then(l => get(l,
        'content')),
    });
  }),

  /**
   * @type {Ember.ComputedProperty<PromiseObject<Object>>}
   */
  clusterConfigurationProxy: computed(function clusterConfiguration() {
    return this.get('configurationManager').getInstallationDetails();
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  allNodes: union(
    'clusterConfigurationProxy.cluster.databases.hosts',
    'clusterConfigurationProxy.cluster.managers.hosts',
    'clusterConfigurationProxy.cluster.workers.hosts'
  ),
});
