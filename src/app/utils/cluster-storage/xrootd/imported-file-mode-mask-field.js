/**
 * Imported file mode mask field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const ImportedFileModeMaskField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'importedFileModeMask',

  /**
   * @override
   */
  isOptional: true,

  regex: /^[0-7][0-7][0-7][0-7]?$/,
});
