/**
 * Definitions for GlusterFS fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { HostnameField } from './glusterfs/hostname-field';
import { TransportField } from './glusterfs/transport-field';
import { MountPointField } from './glusterfs/mount-point-field';
import { XlatorOptionsField } from './glusterfs/xlator-options-field';
import { VolumeField } from './glusterfs/volume-field';
import { PortField } from './glusterfs/port-field';
import { reads } from '@ember/object/computed';

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

  /**
   * @type {ComputedProperty<string>}
   */
  type: reads('context.component.basicGroup.value.type'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  title: computed('type', function title() {
    return this.t('sectionTitle', {
      type: this.t(`basic.type.options.${this.type}.label`),
    });
  }),
  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('type', function isVisible() {
    return this.type === 'glusterfs';
  }),
});
