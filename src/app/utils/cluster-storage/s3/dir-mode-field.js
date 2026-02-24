/**
 * Directory mode field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { StorageTextField } from '../base/storage-text-field';

export const DirModeField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'dirMode',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  regex: /^[0-7][0-7][0-7][0-7]?$/,

  /**
   * @type {ComputedProperty<boolean>}
   */
  importedStorage: reads('parent.parent.value.basic.importedStorage'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEnabled: reads('importedStorage'),

  autoSettings() {
    if (!this.importedStorage) {
      this.valueChanged(null);
    }
  },
});
