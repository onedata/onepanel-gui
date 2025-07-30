/**
 * Credentials of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';
import { computed } from '@ember/object';

export const CredentialsField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'credentials',

  /**
   * @override
   */
  defaultValue: '',

  isVisible: computed('parent.value.credentialsType', function isVisible() {
    return this.parent.value.credentialsType === 'password';
  }),
});
