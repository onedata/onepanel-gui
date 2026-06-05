/**
 * Credentials type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { CredentialsTypeField as CommonCredentialsTypeField } from '../common/credentials-type-field';

export const CredentialsTypeField = CommonCredentialsTypeField.extend({
  /**
   * @override
   */
  options: Object.freeze([
    { value: 'none' },
    { value: 'basic' },
    { value: 'token' },
  ]),

  onEditCredentials() {
    this.set('context.component.isCredentialsEnabled', true);
    this.context.component.httpGroup.getFieldByPath('username')?.resetValue();
    this.context.component.httpGroup.getFieldByPath('password')?.resetValue();
    this.context.component.httpGroup.getFieldByPath('credentials')?.resetValue();
  },
});
