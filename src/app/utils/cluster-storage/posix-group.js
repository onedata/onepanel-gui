/**
 * Definitions for posix fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { MountPointField } from './posix/mount-point-field';
import { RootUidField } from './posix/root-uid-field';
import { RootGidField } from './posix/root-gid-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const PosixGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'posix',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      MountPointField,
      RootUidField,
      RootGidField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
