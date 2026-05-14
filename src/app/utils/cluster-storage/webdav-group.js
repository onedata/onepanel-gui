/**
 * Definitions for WebDAV fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { VerifyServerCertificateField } from './common/verify-server-certificate-field';
import { OnedataAccessTokenField } from './webdav/onedata-access-token-field';
import { AuthorizationHeaderField } from './webdav/authorization-header-field';
import { ConnectionPoolSizeField } from './common/connection-pool-size-field';
import { MaximumUploadSizeField } from './webdav/maximum-upload-size-field';
import { ImportedFileModeField } from './webdav/imported-file-mode-field';
import { ImportedDirectoryModeField } from './webdav/imported-directory-mode-field';
import { EndpointField } from './common/endpoint-field';
import { CredentialsTypeField } from './webdav/credentials-type-field';
import { RangeWriteSupportField } from './webdav/range-write-support-field';
import { UsernameField } from './common/username-field';
import { PasswordField } from './common/password-field';
import { StorageFieldsGroup } from './base/storage-fields-group';

export const WebdavGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'webdav',

  /**
   * @override
   */
  fields: computed(function fields() {
    return [
      EndpointField,
      VerifyServerCertificateField,
      CredentialsTypeField,
      UsernameField,
      PasswordField,
      OnedataAccessTokenField,
      AuthorizationHeaderField,
      RangeWriteSupportField,
      ConnectionPoolSizeField,
      MaximumUploadSizeField,
      ImportedFileModeField,
      ImportedDirectoryModeField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
