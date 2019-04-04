/**
 * Space storage synchronization statistics container
 * Mainly used in space storage synchronization tab
 *
 * @module components/space-storage-synchronization
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { or } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  eventsBus: service(),

  /** @override */
  i18nPrefix: 'components.spaceStorageSynchronization',

  /**
   * Callback to notify change of `syncInterval`
   * Invoked with `syncInterval` arg (see `syncIterval` property)
   * @virtual
   * @type {Function}
   */
  syncIntervalChanged: notImplementedWarn,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual 
   * @type {string}
   */
  syncInterval: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {boolean}
   */
  timeStatsLoading: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {boolean}
   */
  statsFrozen: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {string}
   */
  timeStatsError: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {Array<object>}
   */
  timeStats: undefined,

  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

  importConfigurationOpen: or('importEnabled', 'importConfigurationEdition'),

  /**
   * True if import is enabled in configuration
   * @type {boolean}
   */
  importEnabled: computed(
    'space.importConfiguration.strategy',
    function importEnabled() {
      const strategy = this.get('space.importConfiguration.strategy');
      return !!strategy && strategy !== 'no_import';
    }
  ),

  importConfigurationEdition: false,

  actions: {
    modifySpace(...args) {
      return this.get('modifySpace')(...args)
        .then(() => this.get('eventsBus').trigger(
          this.elementId + '-synchronization-config:close'
        ));
    },
  },
});
