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
  options: computed(function options() {
    return [
      { value: 'none', disabled: true },
      { value: 'sabredav', tip: this.sabredavTip },
      { value: 'moddav', tip: this.moddavTip },
    ];
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  sabredavTip: computed(function sabredavTip() {
    return this.t('webdav.rangeWriteSupport.options.sabredav.tip');
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  moddavTip: computed(function moddavTip() {
    return this.t('webdav.rangeWriteSupport.options.moddav.tip');
  }),

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

  /**
   * @type {ComputedProperty<SafeString>}
   */
  lockHint: computed('value', 'isEnabled', function lockHint() {
    if (!this.isEnabled && this.value === 'none') {
      return this.t('webdav.rangeWriteSupport.lockHintAllDisabled');
    }
    if (this.isEnabled) {
      return this.t('webdav.rangeWriteSupport.lockHintNoneDisabled');
    }
    return null;
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
