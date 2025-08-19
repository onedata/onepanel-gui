/**
 * Max latency field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';
import { computed } from '@ember/object';

export const LatencyMaxField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'latencyMax',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  gte: computed('parent.value.latencyMin', function gte() {
    const latencyMin = this.parent.value.latencyMin;
    return latencyMin !== null ? latencyMin : 0;
  }),
});
