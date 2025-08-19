/**
 * Definitions for posix fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeoutField } from './common/timeout-field';
import { MountPointField } from './posix/mount-point-field';
import { RootUidField } from './posix/root-uid-field';
import { RootGidField } from './posix/root-gid-field';

export const PosixGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'posix',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      MountPointField,
      RootUidField,
      RootGidField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'posix';
  }),
});
