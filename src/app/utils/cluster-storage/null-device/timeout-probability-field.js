/**
 * Timeout probability field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const TimeoutProbabilityField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'timeoutProbability',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  gte: 0,

  /**
   * @override
   */
  lte: 1,
});
