/**
 * Definitions for NFS fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { HostField } from './nfs/host-field';
import { VolumeField } from './nfs/volume-field';
import { ConnectionPoolSizeField } from './common/connection-pool-size-field';
import { DirCacheField } from './nfs/dir-cache-field';
import { ReadAheadField } from './nfs/read-ahead-field';
import { AutoReconnectField } from './nfs/auto-reconnect-field';
import { VersionField } from './nfs/version-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const NfsGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'nfs',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      HostField,
      VersionField,
      VolumeField,
      ConnectionPoolSizeField,
      DirCacheField,
      ReadAheadField,
      AutoReconnectField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
