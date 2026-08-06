/**
 * Definitions for HTTP fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { EndpointField } from './common/endpoint-field';
import { VerifyServerCertificateField } from './common/verify-server-certificate-field';
import { CredentialsTypeField } from './http/credentials-type-field';
import { OnedataAccessTokenField } from './http/onedata-access-token-field';
import { AuthorizationHeaderField } from './http/authorization-header-field';
import { ConnectionPoolSizeField } from './common/connection-pool-size-field';
import { MaxRequestsPerSessionField } from './http/max-requests-per-session-field';
import { FileModeField } from './http/file-mode-field';
import { UsernameField } from './common/username-field';
import { PasswordField } from './common/password-field';
import { StorageFieldsGroup } from './base/storage-fields-group';
import { EmulateRangeReadField } from './http/emulate-range-read-field';
import { MaxEmulatedRangeReadFileSizeField } from './http/max-emulated-range-read-file-size';

export const HttpGroup = StorageFieldsGroup.extend({
  /**
   * @override
   */
  name: 'http',

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
      ConnectionPoolSizeField,
      MaxRequestsPerSessionField,
      FileModeField,
      EmulateRangeReadField,
      MaxEmulatedRangeReadFileSizeField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),
});
