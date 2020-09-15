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
import { computed, get } from '@ember/object';
import { raw, equal, sum } from 'ember-awesome-macros';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { storageImportStatusDescription } from 'onepanel-gui/components/space-status-icons';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';
import { inject as service } from '@ember/service';

const componentMixins = [
  I18n,
  createDataProxyMixin('fileRegistrationExample'),
];

export default Component.extend(...componentMixins, {
  /**
   * @override
   */
  i18nPrefix: 'components.spaceStorageImport',

  i18n: service(),
  spaceManager: service(),

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
   * @type {Object}
   */
  autoImportInfo: undefined,

  /**
   * @virtual
   * @type {Space}
   */
  space: undefined,

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
   * @type {ComputedProperty<number>}
   */
  processedFiles: sum(
    'autoImportInfo.createdFiles',
    'autoImportInfo.modifiedFiles',
    'autoImportInfo.deletedFiles'
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  importStatusDescription: computed(
    'space',
    'autoImportInfo',
    function importStatusDescription() {
      const {
        space,
        autoImportInfo,
        i18n,
      } = this.getProperties('i18n', 'space', 'autoImportInfo');

      return storageImportStatusDescription(i18n, space, autoImportInfo);
    }
  ),

  /**
   * @type {ComputedProperty<Array<{ label: String, value: String }>>}
   */
  importInfoDetailsToShow: computed(
    'autoImportInfo.${stop,start,createdFiles,modifiedFiles,deletedFiles}',
    function importInfoDetailsToShow() {
      const autoImportInfo = this.get('autoImportInfo') || {};

      const details = [];
      ['start', 'stop'].forEach(detailName => {
        const timestamp = get(autoImportInfo, detailName);
        if (timestamp) {
          details.push({
            label: this.t(`importDetails.${detailName}`),
            value: dateFormat([timestamp], { format: 'report' }),
          });
        }
      });
      ['createdFiles', 'modifiedFiles', 'deletedFiles'].forEach(detailName => {
        details.push({
          label: this.t(`importDetails.${detailName}`),
          value: get(autoImportInfo, detailName) || 0,
        });
      });

      return details;
    }
  ),

  /**
   * @returns {Promise<String>}
   */
  fetchFileRegistrationExample() {
    return this.get('spaceManager').getManualImportRequestExample(this.get('space.id'))
      .then(result => (result && result.curl) || '');
  },

  actions: {
    modifyStorageImport(closeFormCallback, autoStorageImportConfig) {
      return this.get('modifySpace')({ autoStorageImportConfig })
        .then(() => safeExec(this, () => closeFormCallback()));
    },
  },
});
