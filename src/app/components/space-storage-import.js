/**
 * Space storage import statistics container
 * Mainly used in space storage import tab
 *
 * @module components/space-storage-import
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { array, raw, not, equal } from 'ember-awesome-macros';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

const componentMixins = [
  I18n,
  createDataProxyMixin('fileRegistrationExample'),
];

export default Component.extend(...componentMixins, {
  /**
   * @override
   */
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
  manualImportEnabled: equal('space.storageImport.mode', raw('manual')),

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

  /**
   * @override
   */
  fetchFileRegistrationExample() {
    return resolve('some_request');
  },

  actions: {
    modifyStorageImport(closeFormCallback, storageImport) {
      return this.get('modifySpace')({ storageImport })
        .then(() => safeExec(this, () => closeFormCallback()));
    },
  },
});
