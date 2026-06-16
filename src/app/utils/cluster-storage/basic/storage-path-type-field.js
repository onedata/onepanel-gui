/**
 * Path type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';
import { computed } from '@ember/object';

const storagePathTypeConfig = {
  posix: { defaultValue: 'canonical', disabled: true },
  glusterfs: { defaultValue: 'canonical', disabled: true },
  nulldevice: { defaultValue: 'canonical' },
  ceph: { defaultValue: 'flat' },
  cephrados: { defaultValue: 'flat', disabled: true },
  s3: {},
  swift: { defaultValue: 'flat' },
  xrootd: { defaultValue: 'canonical', disabled: true },
  http: { defaultValue: 'canonical', disabled: true },
  webdav: { defaultValue: 'canonical', disabled: true },
  nfs: { defaultValue: 'canonical', disabled: true },
};

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
  defaultValue: computed('parent.value.type', function defaultValue() {
    const config = storagePathTypeConfig[this.parent.value?.type];
    if (config) {
      return config.defaultValue ?? null;
    }
    return this.options[0].value;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEnabled: computed('parent.value.type', function isEnabled() {
    const config = storagePathTypeConfig[this.parent.value?.type];
    if (config?.disabled) {
      return false;
    }
    return true;
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  lockHint: computed('isEnabled', 'value', function lockHint() {
    const type = this.t('basic.type.options.' + this.parent.value?.type + '.label');
    if (!this.isEnabled && this.value === 'flat') {
      return this.t('basic.storagePathType.lockedFlatTip', { type });
    } else if (!this.isEnabled && this.value === 'canonical') {
      return this.t('basic.storagePathType.lockedCanonicalTip', { type });
    }
    return '';
  }),

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    const component = this.context.component;
    component.basicGroup.getFieldByPath('importedStorage')?.autoSettings();
    component.basicGroup.getFieldByPath('readonly')?.autoSettings();
    component.s3Group?.getFieldByPath('blockSize')?.autoSettings();
    component.swiftGroup?.getFieldByPath('blockSize')?.autoSettings();
  },
});
