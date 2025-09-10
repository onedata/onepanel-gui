/**
 * OAuth2 IdP of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';
import { computed } from '@ember/object';

export const Oauth2IdpField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'oauth2IdP',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  notEditable: true,

  /**
   * @override
   */
  isVisible: computed('parent.value.credentialsType', function isVisible() {
    const type = this.parent.value?.credentialsType;
    return type === 'oauth2';
  }),
});
