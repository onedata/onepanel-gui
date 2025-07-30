/**
 * Range write support field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';

export const RangeWriteSupportField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'rangeWriteSupport',

  autoSettingValue: undefined,

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'none' },
    { value: 'sabreDav' },
    { value: 'modDav' },
  ]),

  computedValue: computed(
    'autoSettingValue',
    'modifiedValue',
    function computedValue() {
      if (this.autoSettingValue) {
        return this.autoSettingValue;
      } else {
        return this.modifiedValue;
      }
    }
  ),

  readOnlyObserver: observer(
    'context.component.basicGroup.value.readonly',
    function readOnlyObserver() {
      this.set('modifiedValue', null);
      if (this.context.component.basicGroup.value.readonly) {
        this.set('isEnabled', false);
        this.set('autoSettingValue', 'none');
      } else {
        this.set('isEnabled', true);
        this.options[0].disabled = true;
        this.set('autoSettingValue', null);
      }
    }
  ),

  value: reads('computedValue'),

  valueChanged(value) {
    this._super(...arguments);
    this.set('modifiedValue', value);
  },
});
