/**
 * Definitions for Swift fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { UserDomainNameField } from './swift/user-domain-name-field';
import { ProjectNameField } from './swift/project-name-field';
import { AuthUrlField } from './swift/auth-url-field';
import { UsernameField } from './swift/username-field';
import { PasswordField } from './swift/password-field';
import { ProjectDomainNameField } from './swift/project-domain-name-field';
import { ContainerNameField } from './swift/container-name-field';
import { BlockSizeField } from './common/block-size-field';
import { TimeoutField } from './common/timeout-field';

export const SwiftGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'swift',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      UsernameField,
      PasswordField,
      ProjectNameField,
      UserDomainNameField,
      ProjectDomainNameField,
      AuthUrlField,
      ContainerNameField,
      BlockSizeField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'swift';
  }),
});
