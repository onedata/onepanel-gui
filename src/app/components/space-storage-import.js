/**
 * Space storage import statistics container
 * Mainly used in space storage import tab
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get, getProperties } from '@ember/object';
import { raw, equal } from 'ember-awesome-macros';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { storageImportStatusDescription } from 'onepanel-gui/components/space-status-icons';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';
import { inject as service } from '@ember/service';
import { formatNumber } from 'onedata-gui-common/helpers/format-number';
import $ from 'jquery';

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
   * @type {ComputedProperty<Array<{ label: String, value: String, tip: String|undefined }>>}
   */
  importInfoDetailsCol1ToShow: computed(
    'autoImportInfo.${stop,start,createdFiles,modifiedFiles,unmodifiedFiles,deletedFiles,failedFiles}',
    function importInfoDetailsToShow() {
      const autoImportInfo = this.get('autoImportInfo') || {};
      const {
        createdFiles = 0,
          modifiedFiles = 0,
          unmodifiedFiles = 0,
          deletedFiles = 0,
          failedFiles = 0,
      } = getProperties(
        autoImportInfo,
        'createdFiles',
        'modifiedFiles',
        'unmodifiedFiles',
        'deletedFiles',
        'failedFiles'
      );

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
      details.push({
        label: this.t('importDetails.processedFiles'),
        value: formatNumber(
          createdFiles + modifiedFiles + unmodifiedFiles + deletedFiles + failedFiles
        ),
        tip: this.t('importDetails.processedFilesTip'),
        classNames: 'processed-counter-related',
        highlightOnHover: 'processed-counter-related',
      }, {
        label: this.t('importDetails.totalStorageFiles'),
        value: formatNumber(createdFiles + modifiedFiles + unmodifiedFiles),
        tip: this.t('importDetails.totalStorageFilesTip'),
        classNames: 'storage-counter-related',
        highlightOnHover: 'storage-counter-related',
      });

      return details;
    }
  ),

  /**
   * @type {ComputedProperty<Array<{ label: String, value: String }>>}
   */
  importInfoDetailsCol2ToShow: computed(
    'autoImportInfo.${createdFiles,modifiedFiles,unmodifiedFiles,deletedFiles,failedFiles}',
    'space.id',
    function importInfoDetailsToShow() {
      const autoImportInfo = this.get('autoImportInfo') || {};
      const spaceId = this.get('space.id') || '';
      const infoObjects = [
        'createdFiles',
        'modifiedFiles',
        'unmodifiedFiles',
        'deletedFiles',
        'failedFiles',
      ].map(detailName => ({
        label: this.t(`importDetails.${detailName}`),
        value: formatNumber(get(autoImportInfo, detailName) || 0),
        tip: this.t(`importDetails.${detailName}Tip`, { spaceId }),
        classNames: 'processed-counter-related',
      }));
      infoObjects.slice(0, 3).forEach(obj => obj.classNames += ' storage-counter-related');
      return infoObjects;
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
    toggleImportDetailsHovered(isHovered, event) {
      const hoverTargetClass = event.target.getAttribute('data-highlight-on-hover');
      if (hoverTargetClass) {
        $(this.get('element')).find(`.${hoverTargetClass}`)
          .toggleClass('detail-highlighted', isHovered);
      }
    },
  },
});
