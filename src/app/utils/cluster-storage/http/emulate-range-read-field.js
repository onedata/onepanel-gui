/**
 * Emulate range read field of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageToggleField } from '../base/storage-toggle-field';

export const EmulateRangeReadField = StorageToggleField.extend({
  /**
   * @override
   */
  name: 'emulateRangeRead',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  defaultValue: false,
});
