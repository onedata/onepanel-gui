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
import { VolumeServerHostField } from './glusterfs/volume-server-host-field';
import { VolumeTransportField } from './glusterfs/volume-transport-field';
import { RelativeMountpointInVolumeField } from './glusterfs/relative-mountpoint-in-volume-field';
import { CustomClientTranslatorOptionsField } from './glusterfs/custom-client-translator-options-field';
import { VolumeNameField } from './glusterfs/volume-name-field';
import { VolumeServerPortField } from './glusterfs/volume-server-port-field';

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
      VolumeNameField,
      VolumeServerHostField,
      VolumeServerPortField,
      VolumeTransportField,
      RelativeMountpointInVolumeField,
      CustomClientTranslatorOptionsField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'glusterfs';
  }),
});
