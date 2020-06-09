/**
 * Space storage import statistics container
 * Mainly used in space storage import tab
 *
 * @module components/space-storage-import
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { bool } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  eventsBus: service(),

  /** @override */
  i18nPrefix: 'components.spaceStorageImport',

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

  /**
   * @type {ComputedProperty<boolean>}
   */
  importConfigurationOpen: bool('space.importMode'),

  actions: {
    modifySpace(...args) {
      const {
        modifySpace,
        eventsBus,
        elementId,
      } = this.getProperties('modifySpace', 'eventsBus', 'elementId');
      return modifySpace(...args)
        .then(() => eventsBus.trigger(`${elementId}-import-config:close`));
    },
  },
});
