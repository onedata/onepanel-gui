/**
 * Max latency field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';
import { computed } from '@ember/object';

export const MaxLatencyField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'latencyMax',

  isOptional: true,

  defaultValue: null,

  gte: computed('parent.value.latencyMin', function () {
    const latencyMin = this.parent.value.latencyMin;
    return latencyMin !== null ? latencyMin : 0;
  }),
});
