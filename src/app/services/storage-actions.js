/**
 * GUI actions related to storage management.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { getProperties } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import SaveStorageModificationAction from 'onepanel-gui/utils/storage-actions/save-storage-modification-action';

export default Service.extend(I18n, {
  storageManager: service(),
  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'services.storageActions',

  /**
   * @public
   * @param {SaveStorageModificationActionContext} context
   * @returns {Utils.StorageActions.SaveStorageModificationAction}
   */
  createSaveStorageModificationAction(context) {
    return SaveStorageModificationAction.create({ ownerSource: this, context });
  },

  /**
   * Removes storage
   * @param {Onepanel.StorageDetails} storage
   * @returns {Promise}
   */
  removeStorage(storage) {
    const {
      storageManager,
      globalNotify,
    } = this.getProperties('storageManager', 'globalNotify');
    const {
      id,
      name,
    } = getProperties(storage, 'id', 'name');
    return storageManager.removeStorage(id)
      .then(() => {
        globalNotify.info(this.t('storageRemovedSuccessfully', { name }));
      })
      .catch(error => {
        globalNotify.backendError(this.t('removingStorage'), error);
        throw error;
      });
  },
});
