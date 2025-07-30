/**
 * Definitions for NFS fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { HostnameField } from './nfs/hostname-field';
import { VolumeField } from './nfs/volume-field';
import { ConnectionPoolSizeField } from './nfs/connection-pool-size-field';
import { DirectoryCachingField } from './nfs/directory-caching-field';
import { ReadaheadSizeField } from './nfs/readahead-size-field';
import { AutoReconnectAttemptsField } from './nfs/auto-reconnect-attempts-field';
import { NfsVersionField } from './nfs/nfs-version-field';

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
      HostnameField,
      NfsVersionField,
      VolumeField,
      ConnectionPoolSizeField,
      DirectoryCachingField,
      ReadaheadSizeField,
      AutoReconnectAttemptsField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'nfs';
  }),
});
