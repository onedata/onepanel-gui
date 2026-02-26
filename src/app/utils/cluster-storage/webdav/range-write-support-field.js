/**
 * Range write support field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export const RangeWriteSupportField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'rangeWriteSupport',

  /**
   * @override
   */
  defaultValue: 'none',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'none', disabled: true },
    { value: 'sabredav' },
    { value: 'moddav' },
  ]),

  /**
   * @type {ComputedProperty<boolean>}
   */
  readOnly: reads('parent.parent.value.basic.readonly'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEnabled: computed('readOnly', function isEnabled() {
    return !this.readOnly;
  }),

  autoSettings() {
    if (this.readOnly) {
      if (this.value !== 'none') {
        this.valueChanged('none');
      }
    } else {
      this.set('defaultValue', null);
      if (this.value === 'none') {
        this.valueChanged(null);
      }
    }
  },
});
