/**
 * Readahead size field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const ReadAheadField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'readAhead',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  integer: true,

  /**
   * @override
   */
  gte: 0,

  /**
   * @override
   */
  defaultValue: 0,
});
