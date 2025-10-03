/**
 * Type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageDropdownField } from '../base/storage-dropdown-field';
import { computed } from '@ember/object';

export const TypeField = StorageDropdownField.extend({
  /**
   * @override
   */
  name: 'type',

  optionsToSelect: Object.freeze([
    { value: 'cephrados' },
    { value: 'posix' },
    { value: 'nfs' },
    { value: 's3' },
    { value: 'swift' },
    { value: 'glusterfs' },
    { value: 'webdav' },
    { value: 'http' },
    { value: 'xrootd' },
    { value: 'nulldevice' },
  ]),

  /**
   * @override
   */
  options: computed('mode', function options() {
    const baseOptions = this.optionsToSelect;
    if (this.mode === 'edit') {
      return baseOptions;
    } else {
      return [...baseOptions, { value: 'ceph' }];
    }
  }),

  /**
   * @override
   */
  notEditable: true,

  /**
   * @override
   */
  showSearch: false,

  /**
   * @override
   */
  defaultValue: 'cephrados',

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    this.context.component.fields.reset();
    this._super(...arguments);
    this.context.component.storageTypeChanged(this.value);
  },
});
