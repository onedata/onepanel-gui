import Component from '@ember/component';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import { reads } from '@ember/object/computed';
import { array, raw, not } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceStorageImport.startStopScanButton',

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
   * @virtual
   * @type {String}
   */
  autoImportStatus: undefined,

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
});
