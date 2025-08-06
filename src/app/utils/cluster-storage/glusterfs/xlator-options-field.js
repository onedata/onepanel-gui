/**
 * Custom client translator options field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';

export const XlatorOptionsField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'xlatorOptions',

  /**
   * @override
   */
  isOptional: true,
});
