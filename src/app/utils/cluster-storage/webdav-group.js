/**
 * Definitions for WebDAV fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { TimeoutField } from './common/timeout-field';
import { VerifyServerCertificateField } from './common/verify-server-certificate-field';
import { OnedataAccessTokenField } from './webdav/onedata-access-token-field';
import { AuthorizationHeaderField } from './webdav/authorization-header-field';
import { ConnectionPoolSizeField } from './common/connection-pool-size-field';
import { MaximumUploadSizeField } from './webdav/maximum-upload-size-field';
import { ImportedFileModeField } from './webdav/imported-file-mode-field';
import { ImportedDirectoryModeField } from './webdav/imported-directory-mode-field';
import { EndpointField } from './common/endpoint-field';
import { CredentialsTypeField } from './webdav/credentials-type-field';
import { CredentialsField } from './webdav/credentials-field';
import { Oauth2IdpField } from './webdav/oauth2-idp-field';
import { RangeWriteSupportField } from './webdav/range-write-support-field';

export const WebdavGroup = FormFieldsGroup.extend({
  /**
   * @virtual
   */
  context: undefined,

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
      CredentialsField,
      Oauth2IdpField,
      OnedataAccessTokenField,
      AuthorizationHeaderField,
      RangeWriteSupportField,
      ConnectionPoolSizeField,
      MaximumUploadSizeField,
      ImportedFileModeField,
      ImportedDirectoryModeField,
      TimeoutField,
    ].map((caveatsGroupClass) => caveatsGroupClass.create({
      context: this.context,
    }));
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('context.component.basicGroup.value.type', function isVisible() {
    return this.context.component.basicGroup.value.type === 'webdav';
  }),
});
