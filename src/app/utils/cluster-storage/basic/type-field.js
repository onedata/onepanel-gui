/**
 * Type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageDropdownField } from '../base/storage-dropdown-field';

export const TypeField = StorageDropdownField.extend({
  /**
   * @override
   */
  name: 'type',

  /**
   * @override
   */
  options: Object.freeze([
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

  notEditable: true,

  /**
   * @override
   */
  showSearch: false,

  /**
   * @override
   */
  defaultValue: 'cephrados',

  valueChanged() {
    this.context.component.fields.reset();
    this._super(...arguments);
    this.context.component.storageTypeChanged(this.value);
  },
});
