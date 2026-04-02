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
import { SwiftBlockSizeField } from './swift/block-size-field';
import { reads } from '@ember/object/computed';

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
   * @override
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
      SwiftBlockSizeField,
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
    return this.type === 'swift';
  }),
});
