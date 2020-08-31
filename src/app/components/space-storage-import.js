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
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { array, raw, not } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  eventsBus: service(),

  /** @override */
  i18nPrefix: 'components.spaceStorageImport',

  /**
   * Callback to notify change of `importInterval`
   * Invoked with `importInterval` arg (see `importIterval` property)
   * @virtual
   * @type {Function}
   */
  importIntervalChanged: notImplementedWarn,

  /**
   * See `mixins/components/space-item-import-stats`
   * @virtual 
   * @type {string}
   */
  importInterval: undefined,

  /**
   * See `mixins/components/space-item-import-stats`
   * @virtual
   * @type {boolean}
   */
  timeStatsLoading: undefined,

  /**
   * See `mixins/components/space-item-import-stats`
   * @virtual
   * @type {string}
   */
  timeStatsError: undefined,

  /**
   * See `mixins/components/space-item-import-stats`
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
   * @virtual
   * @type {String}
   */
  autoImportStatus: undefined,

  /**
   * @type {ComputedProperty<boolean>}
   */
  importConfigurationOpen: reads('space.storageImportEnabled'),

  /**
   * @virtual
   * @type {Function}
   */
  stopScan: notImplementedReject,

  /**
   * @virtual
   * @type {Function}
   */
  startScan: notImplementedReject,

  /**
   * @type {ComputedProperty<boolean>}
   */
  allowScanStart: not(array.includes(
    raw(['enqueued', 'running', 'aborting']),
    'autoImportStatus'
  )),

  /**
   * @type {ComputedProperty<boolean>}
   */
  allowScanStop: array.includes(
    raw(['enqueued', 'running']),
    'autoImportStatus'
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showScanStop: reads('allowScanStop'),

  actions: {
    modifyStorageImport(storageImport) {
      const {
        modifySpace,
        eventsBus,
        elementId,
      } = this.getProperties('modifySpace', 'eventsBus', 'elementId');
      return modifySpace({ storageImport })
        .then(() => eventsBus.trigger(`${elementId}-import-config:close`));
    },
  },
});
