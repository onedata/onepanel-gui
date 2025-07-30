/**
 * Timeout field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const TimeoutField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'timeout',

  // /**
  //  * @override
  //  */
  // defaultValue: '300000',
  isOptional: true,
});
