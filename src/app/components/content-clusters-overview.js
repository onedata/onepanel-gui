import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  guiUtils: service(),
  providerManager: service(),
  spaceManager: service(),
  storageManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersOverview',

  oneproviderRoute: computed(function oneproviderRoute() {
    return ['onedata.sidebar.content', 'data', this.get('cluster.serviceId')];
  }),

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
});
