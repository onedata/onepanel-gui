/**
 * Type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
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
    { value: 's3' },
    { value: 'cephrados' },
    { value: 'posix' },
    { value: 'nfs' },
    { value: 'http' },
    { value: 'webdav' },
    { value: 'xrootd' },
    { value: 'swift' },
    { value: 'glusterfs' },
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
  defaultValue: 's3',

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    const component = this.context.component;
    component.fields.reset();
    this._super(...arguments);
    component.basicGroup.getFieldByPath('importedStorage')?.autoSettings();
    component.basicGroup.getFieldByPath('readonly')?.autoSettings();
    component.s3Group?.getFieldByPath('blockSize')?.autoSettings();
    component.s3Group?.getFieldByPath('fileMode')?.autoSettings();
    component.s3Group?.getFieldByPath('dirMode')?.autoSettings();
    component.nullDeviceGroup
      ?.getFieldByPath('simulatedFilesystemGrowSpeed')
      ?.autoSettings();
    component.nullDeviceGroup
      ?.getFieldByPath('simulatedFilesystemParameters')
      ?.autoSettings();
    component.webdavGroup?.getFieldByPath('rangeWriteSupport')?.autoSettings();
    component.setDefaultQosParams();
  },
});
