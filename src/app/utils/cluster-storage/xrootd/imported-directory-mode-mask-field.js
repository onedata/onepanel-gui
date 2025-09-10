/**
 * Imported directory mode mask field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';

export const ImportedDirectoryModeMaskField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'dirModeMask',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  regex: /^[0-7][0-7][0-7][0-7]?$/,

  /**
   * @override
   */
  notEditable: true,
});
