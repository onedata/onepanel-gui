/**
 * Definitions for HTTP fields of the cluster storage form.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { EndpointField } from './common/endpoint-field';
import { VerifyServerCertificateField } from './common/verify-server-certificate-field';
import { CredentialsTypeField } from './http/credentials-type-field';
import { OnedataAccessTokenField } from './http/onedata-access-token-field';
import { AuthorizationHeaderField } from './http/authorization-header-field';
import { ConnectionPoolSizeField } from './common/connection-pool-size-field';
import { MaxRequestsPerSessionField } from './http/max-requests-per-session-field';
import { FileModeField } from './http/file-mode-field';
import { UsernameField } from './http/username-field';
import { PasswordField } from './http/password-field';
import { reads } from '@ember/object/computed';

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
    return this.type === 'http';
  }),
});
