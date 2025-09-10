/**
 * Common fields for all storage types in the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { NameField } from './basic/name-field';
import { StoragePathTypeField } from './basic/storage-path-type-field';
import { ReadonlyField } from './basic/readonly-field';
import { ImportedStorageField } from './basic/imported-storage-field';
import { LumaFeedField } from './basic/luma-feed-field';
import { TypeField } from './basic/type-field';

export const BasicGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'basic',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      TypeField,
      NameField,
      StoragePathTypeField,
      ImportedStorageField,
      ReadonlyField,
      LumaFeedField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
