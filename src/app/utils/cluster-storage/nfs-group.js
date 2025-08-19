/**
 * Definitions for NFS fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { HostField } from './nfs/host-field';
import { VolumeField } from './nfs/volume-field';
import { ConnectionPoolSizeField } from './common/connection-pool-size-field';
import { DirCacheField } from './nfs/dir-cache-field';
import { ReadAheadField } from './nfs/read-ahead-field';
import { AutoReconnectField } from './nfs/auto-reconnect-field';
import { VersionField } from './nfs/version-field';

export const NfsGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'nfs',

  /**
   * @virtual
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

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'nfs';
  }),
});
