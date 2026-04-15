/**
 * Definitions for WebDAV fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
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
import { RangeWriteSupportField } from './webdav/range-write-support-field';
import { UsernameField } from './common/username-field';
import { PasswordField } from './common/password-field';
import { reads } from '@ember/object/computed';

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
    return this.type === 'webdav';
  }),
});
