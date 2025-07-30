/**
 * Imported info field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageToggleField } from '../base/storage-toggle-field';

export const ImportedField = StorageToggleField.extend({
  /**
   * @override
   */
  name: 'importedStorage',

  /**
   * @override
   */
  defaultValue: false,

  valueChanged() {
    this._super(...arguments);
    this.context.component.importedStorageChanged();
  },
});
