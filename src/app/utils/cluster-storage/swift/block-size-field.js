/**
 * Block size field of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { BlockSizeField } from '../common/block-size-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export const SwiftBlockSizeField = BlockSizeField.extend({
  /**
   * @override
   */
  gte: 0,

  /**
   * @override
   */
  gt: null,

  /**
   * @type {ComputedProperty<'flat'|'canonical'|null>}
   */
  storagePathType: reads('parent.parent.value.basic.storagePathType'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEnabled: computed('storagePathType', function isEnabled() {
    return this.storagePathType !== 'canonical';
  }),

  autoSettings() {
    if (this.storagePathType === 'canonical' || this.value === 0) {
      this.valueChanged(
        this.storagePathType === 'canonical' ? 0 : null
      );
    }
  },
});
