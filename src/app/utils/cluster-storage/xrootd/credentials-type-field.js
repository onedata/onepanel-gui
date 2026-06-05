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
    { value: 'pwd' },
  ]),

  onEditCredentials() {
    this.set('context.component.isCredentialsEnabled', true);
    this.context.component.xrootdGroup.getFieldByPath('username')?.resetValue();
    this.context.component.xrootdGroup.getFieldByPath('password')?.resetValue();
  },
});
