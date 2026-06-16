/**
 * Definitions for XRootD fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { UrlField } from './xrootd/url-field';
import { ImportedDirectoryModeMaskField } from './xrootd/imported-directory-mode-mask-field';
import { ImportedFileModeMaskField } from './xrootd/imported-file-mode-mask-field';
import { CredentialsTypeField } from './xrootd/credentials-type-field';
import { UsernameField } from './xrootd/username-field';
import { PasswordField } from './xrootd/password-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const XrootdGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'xrootd',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      UrlField,
      ImportedFileModeMaskField,
      ImportedDirectoryModeMaskField,
      CredentialsTypeField,
      UsernameField,
      PasswordField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
