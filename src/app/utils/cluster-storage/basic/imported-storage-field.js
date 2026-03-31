/**
 * Imported info field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
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

  /**
   * @type {ComputedProperty<string>}
   */
  storageType: reads('parent.parent.value.basic.type'),

  /**
   * @type {ComputedProperty<'flat'|'canonical'|null>}
   */
  storagePathType: reads('parent.parent.value.basic.storagePathType'),

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    const component = this.context.component;
    component.basicGroup.getFieldByPath('readonly')?.autoSettings();
    component.nullDeviceGroup
      ?.getFieldByPath('simulatedFilesystemGrowSpeed')
      ?.autoSettings();
    component.nullDeviceGroup
      ?.getFieldByPath('simulatedFilesystemParameters')
      ?.autoSettings();
    component.s3Group?.getFieldByPath('blockSize')?.autoSettings();
    component.s3Group?.getFieldByPath('fileMode')?.autoSettings();
    component.s3Group?.getFieldByPath('dirMode')?.autoSettings();
  },

  /**
   * @type {ComputedProperty<boolean>}
   *
   */
  isEnabled: computed(
    'storageType',
    'context.component.storageProvidesSupport',
    'storagePathType',
    function isEnabled() {
      if (this.storagePathType === null) {
        return true;
      }
      return this.storageType !== 'http' &&
        this.storageType !== 's3' &&
        this.storageType !== 'swift' &&
        this.storageType !== 'cephrados' &&
        !this.context.component.storageProvidesSupport;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString|null>}
   */
  disabledControlTip: computed(
    'storageType',
    'storagePathType',
    function disabledControlTip() {
      if (this.storageType === 'http') {
        return this.t('basic.importedStorage.httpOnlyImported');
      } else if (
        ['s3', 'cephrados', 'swift'].includes(this.storageType) &&
        this.storagePathType === 'flat'
      ) {
        return this.t(
          'basic.importedStorage.lockedFlatTip', {
            type: this.t(`basic.type.options.${this.storageType}.label`),
          }
        );
      } else if (
        ['s3', 'swift'].includes(this.storageType) &&
        this.storagePathType === 'canonical'
      ) {
        return this.t(
          'basic.importedStorage.lockedCanonicalTip', {
            type: this.t(`basic.type.options.${this.storageType}.label`),
          }
        );
      }
      return null;
    }
  ),

  autoSettings() {
    if (this.storageType === 'http') {
      this.valueChanged(true);
    } else if (this.storageType === 's3' || this.storageType === 'swift') {
      this.valueChanged(this.storagePathType === 'canonical');
    } else if (this.context.component.storageProvidesSupport) {
      this.valueChanged(this.context.component.storage?.importedStorage);
    }
  },
});
