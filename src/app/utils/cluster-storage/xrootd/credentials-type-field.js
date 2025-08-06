/**
 * Credentials type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';

export const CredentialsTypeField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'credentialsType',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'none' },
    { value: 'pwd' },
  ]),

  defaultValue: 'none',
});
