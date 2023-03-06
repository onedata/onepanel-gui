/**
 * GUI actions related to storage management.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { getProperties, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Service.extend(I18n, {
  storageManager: service(),
  globalNotify: service(),
  i18n: service(),

  i18nPrefix: 'services.storageActions',

  /**
   * Modifies storage
   * @param {Onepanel.StorageDetails} storage
   * @param {Onepanel.StorageDetails} newDetails
   * @returns {Promise}
   */
  modifyStorage(storage, newDetails) {
    const {
      storageManager,
      globalNotify,
    } = this.getProperties('storageManager', 'globalNotify');
    const {
      id,
      name,
    } = getProperties(storage, 'id', 'name');
    return storageManager.modifyStorage(id, name, newDetails)
      .then(result => {
        globalNotify.info(this.t('storageModifiedSuccessfully', { name }));
        const verificationPassed = get(result, 'data.verificationPassed');
        if (verificationPassed === false) {
          globalNotify.warningAlert(this.t('storageCheckFailed', { name }));
        }
        return result;
      })
      .catch(error => {
        globalNotify.backendError(this.t('modifyingStorage'), error);
        throw error;
      });
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
