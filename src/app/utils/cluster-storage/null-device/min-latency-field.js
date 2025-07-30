/**
 * Min latency field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const MinLatencyField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'latencyMin',

  isOptional: true,

  defaultValue: null,

  gte: 0,
});
