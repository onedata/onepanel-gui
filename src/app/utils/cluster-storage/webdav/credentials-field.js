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

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  isVisible: computed('parent.value.credentialsType', function isVisible() {
    const type = this.parent.value?.credentialsType;
    return type === 'basic' || type === 'oauth2';
  }),

  label: computed('parent.value.credentialsType', function label() {
    const type = this.parent.value?.credentialsType;
    if (type === 'oauth2') {
      return this.getTranslation('labelOauth2');
    } else {
      return this.getTranslation('label');
    }
  }),
});
