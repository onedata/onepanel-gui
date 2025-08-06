/**
 * Definitions for HTTP fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeoutField } from './http/timeout-field';
import { EndpointField } from './http/endpoint-field';
import { VerifyServerCertificateField } from './http/verify-server-certificate-field';
import { CredentialsTypeField } from './http/credentials-type-field';
import { OnedataAccessTokenField } from './http/onedata-access-token-field';
import { AuthorizationHeaderField } from './http/authorization-header-field';
import { ConnectionPoolSizeField } from './http/connection-pool-size-field';
import { MaxRequestsPerSessionField } from './http/max-requests-per-session-field';
import { FileModeField } from './http/file-mode-field';
import { CredentialsField } from './http/credentials-field';

export const HttpGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @override
   */
  name: 'http',

  /**
   * @virtual
   */
  fields: computed(function fields() {
    return [
      EndpointField,
      VerifyServerCertificateField,
      CredentialsTypeField,
      CredentialsField,
      OnedataAccessTokenField,
      AuthorizationHeaderField,
      ConnectionPoolSizeField,
      MaxRequestsPerSessionField,
      FileModeField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'http';
  }),
});
