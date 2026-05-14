/**
 * Definitions for GlusterFS fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { HostnameField } from './glusterfs/hostname-field';
import { TransportField } from './glusterfs/transport-field';
import { MountPointField } from './glusterfs/mount-point-field';
import { XlatorOptionsField } from './glusterfs/xlator-options-field';
import { VolumeField } from './glusterfs/volume-field';
import { PortField } from './glusterfs/port-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const GlusterfsGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'glusterfs',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      VolumeField,
      HostnameField,
      PortField,
      TransportField,
      MountPointField,
      XlatorOptionsField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
