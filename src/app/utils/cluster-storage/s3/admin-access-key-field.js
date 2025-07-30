/**
 * Admin access key field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';

export const AdminAccessKeyField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'accessKey',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @override
   */
  isOptional: true,
});
