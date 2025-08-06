/**
 * Definitions for GlusterFS fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeoutField } from './s3/timeout-field';
import { HostnameField } from './glusterfs/hostname-field';
import { TransportField } from './glusterfs/transport-field';
import { MountPointField } from './glusterfs/mount-point-field';
import { XlatorOptionsField } from './glusterfs/xlator-options-field';
import { VolumeField } from './glusterfs/volume-field';
import { PortField } from './glusterfs/port-field';

export const GlusterfsGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'glusterfs',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      VolumeField,
      HostnameField,
      PortField,
      TransportField,
      MountPointField,
      XlatorOptionsField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'glusterfs';
  }),
});
