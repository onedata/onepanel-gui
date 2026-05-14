/**
 * Definitions for Swift fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { UserDomainNameField } from './swift/user-domain-name-field';
import { ProjectNameField } from './swift/project-name-field';
import { AuthUrlField } from './swift/auth-url-field';
import { UsernameField } from './swift/username-field';
import { PasswordField } from './swift/password-field';
import { ProjectDomainNameField } from './swift/project-domain-name-field';
import { ContainerNameField } from './swift/container-name-field';
import { SwiftBlockSizeField } from './swift/block-size-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const SwiftGroup = StorageFieldsGroup.extend({
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
});
