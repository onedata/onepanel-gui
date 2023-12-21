/**
 * Saves storage modified options. Shows acknowledge modal, if some fields are
 * somehow dangerous to modify.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

/**
 * @typedef {Object} SaveStorageModificationActionContext
 * @param {string} storageId
 * @param {Record<string, unknown>} modifiedStorageOptions
 */

const WarningType = Object.freeze({
  Restart: 'restart',
  Qos: 'qos',
});

const storageOptionCausingQosWarning = 'qosParameters';
const storageOptionsNotCausingRestartWarning = Object.freeze([
  'name',
  'readonly',
  'importedStorage',
  'lumaFeed',
  'lumaFeedUrl',
  'lumaFeedApiKey',
  storageOptionCausingQosWarning,
]);

export default Action.extend({
  modalManager: service(),
  storageManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.storageActions.saveStorageModificationAction',

  /**
   * @virtual
   * @type {SaveStorageModificationActionContext}
   */
  context: undefined,

  /**
   * @override
   */
  className: 'save-storage-modification-action-trigger',

  /**
   * @private
   * @type {ComputedProperty<SaveStorageModificationActionContext['storageId']>}
   */
  storageId: reads('context.storageId'),

  /**
   * @private
   * @type {ComputedProperty<SaveStorageModificationActionContext['modifiedStorageOptions']>}
   */
  modifiedStorageOptions: reads('context.modifiedStorageOptions'),

  /**
   * @private
   * @type {ComputedProperty<Array<WarningType>>}
   */
  warningsToShowBeforeSaving: computed(
    'modifiedStorageOptions',
    function warningsToShowBeforeSaving() {
      const changedStorageOptions = Object.keys(this.modifiedStorageOptions);
      const warnings = new Set();

      changedStorageOptions.forEach((option) => {
        if (!storageOptionsNotCausingRestartWarning.includes(option)) {
          warnings.add(WarningType.Restart);
        }
        if (option === storageOptionCausingQosWarning) {
          warnings.add(WarningType.Qos);
        }
      });

      return [...warnings];
    }
  ),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const { modifiedStorageOptions, warningsToShowBeforeSaving } = this;
    const storageBeforeModification = await this.getStorage();

    const changedStorageOptions = Object.keys(modifiedStorageOptions);
    // Do real persistence only if there is sth to save.
    if (changedStorageOptions.length) {
      // We need to show warnings before saving.
      if (warningsToShowBeforeSaving.length) {
        await this.modalManager
          .show('save-storage-modification-ack-modal', {
            warnings: warningsToShowBeforeSaving,
            onSubmit: () =>
              result.interceptPromise(this.saveStorageModification()),
          }).hiddenPromise;
      } else {
        await result.interceptPromise(this.saveStorageModification());
      }
    } else {
      // Nothing to save. We can say that everything is saved.
      await result.interceptPromise(resolve({ verificationPassed: true }));
    }

    result.cancelIfPending();

    if (result.status === 'done') {
      set(result, 'result', {
        storageBeforeModification,
        storageAfterModification: await this.getStorage(),
        verificationPassed: result.result.verificationPassed,
      });

      if (!result.result.verificationPassed) {
        this.globalNotify.warningAlert(this.t('warningStorageCheckFailed', {
          name: storageBeforeModification.name,
        }));
      }
    }

    return result;
  },

  /**
   * @private
   * @returns {Promise<{ verificationPassed: boolean }>}
   */
  async saveStorageModification() {
    return await this.storageManager.modifyStorage(
      this.storageId,
      this.modifiedStorageOptions
    );
  },

  /**
   * @private
   * @returns {Promise<ClusterStorage>}
   */
  async getStorage() {
    return (await this.storageManager.getStorageDetails(this.storageId)).content;
  },
});
