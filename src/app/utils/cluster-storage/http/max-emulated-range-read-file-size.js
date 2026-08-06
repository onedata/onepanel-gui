/**
 * Max emulated range read file size field of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export const MaxEmulatedRangeReadFileSizeField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'maxEmulatedRangeReadFileSize',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  gte: 0,

  /**
   * @type {ComputedProperty<string>}
   */
  emulateRangeRead: reads('parent.parent.value.http.emulateRangeRead'),

  /**
   * @override
   */
  isEnabled: computed('emulateRangeRead', function isEnabled() {
    return this.emulateRangeRead;
  }),
});
