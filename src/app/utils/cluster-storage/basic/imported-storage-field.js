/**
 * Imported info field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { StorageToggleField } from '../base/storage-toggle-field';
import { computed } from '@ember/object';

export const ImportedStorageField = StorageToggleField.extend({
  /**
   * @override
   */
  name: 'importedStorage',

  /**
   * @override
   */
  defaultValue: false,

  storageType: reads('parent.parent.value.basic.type'),

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    const component = this.context.component;
    component.basicGroup.getFieldByPath('readonly')?.autoSettings();
    component.nullDeviceGroup?.getFieldByPath('simulatedFilesystemGrowSpeed')?.autoSettings();
    component.nullDeviceGroup?.getFieldByPath('simulatedFilesystemParameters')?.autoSettings();
    component.s3Group?.getFieldByPath('blockSize')?.autoSettings();
    component.s3Group?.getFieldByPath('fileMode')?.autoSettings();
    component.s3Group?.getFieldByPath('dirMode')?.autoSettings();
  },

  /**
   * @type {boolean}
   */
  isEnabled: computed(
    'storageType',
    'context.component.storageProvidesSupport',
    function isEnabled() {
      return this.storageType !== 'http' &&
        this.storageType !== 's3' &&
        !this.context.component.storageProvidesSupport;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString|null>}
   */
  disabledControlTip: computed(
    'storageType',
    function disabledControlTip() {
      if (this.storageType === 'http') {
        return this.t('basic.importedStorage.httpOnlyImported');
      }
      return null;
    }
  ),

  autoSettings() {
    if (this.storageType === 'http') {
      this.valueChanged(true);
    } else if (this.storageType === 's3') {
      this.valueChanged(this.parent.parent.value.basic.storagePathType === 'canonical');
    } else if (this.context.component.storageProvidesSupport) {
      this.valueChanged(this.context.component.storage?.importedStorage);
    }
  },
});
