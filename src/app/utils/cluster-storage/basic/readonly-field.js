/**
 * Readonly info field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { StorageToggleField } from '../base/storage-toggle-field';
import { computed } from '@ember/object';

export const ReadonlyField = StorageToggleField.extend({
  /**
   * @override
   */
  name: 'readonly',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @type {boolean}
   */
  importedStorage: reads('parent.parent.value.basic.importedStorage'),

  /**
   * @type {'flat'|'canonical'|null}
   */
  storagePathType: reads('parent.parent.value.basic.storagePathType'),

  /**
   * @type {string}
   */
  storageType: reads('parent.parent.value.basic.type'),

  /**
   * @type {boolean}
   */
  isEnabled: computed(
    'importedStorage',
    'storagePathType',
    'storageType',
    function isEnabled() {
      const locked = !this.importedStorage ||
        this.storageType === 'http' ||
        (
          this.storageType === 's3' &&
          this.storagePathType === 'canonical' &&
          this.importedStorage
        );

      return !locked;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString|null>}
   */
  disabledControlTip: computed(
    'importedStorage',
    'storageType',
    function disabledControlTip() {
      if (this.storageType === 'http') {
        return this.t('basic.readonly.httpOnlyReadonlyTip');
      } else if (!this.importedStorage) {
        return this.t('basic.readonly.cannotReadonlyNotImportedTip');
      }
      return null;
    }
  ),

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    this.context.component.webdavGroup?.getFieldByPath('rangeWriteSupport')?.autoSettings();
  },

  autoSettings() {
    let value = null;

    if (!this.importedStorage) {
      value = false;
    }

    if (this.storageType === 'http' ||
      (this.storageType === 's3' &&
        this.storagePathType === 'canonical' &&
        this.importedStorage
      )) {
      value = true;
    }

    if (value !== null) {
      this.valueChanged(value);
    }
  },
});
