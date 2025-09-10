/**
 * Path type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';
import { computed } from '@ember/object';

export const StoragePathTypeField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'storagePathType',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'flat' },
    { value: 'canonical' },
  ]),

  /**
   * @override
   */
  notEditable: true,

  /**
   * @override
   */
  defaultValue: computed(function defaultValue() {
    return this.options[0].value;
  }),

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    this.context.component.storagePathTypeChanged();
  },
});
