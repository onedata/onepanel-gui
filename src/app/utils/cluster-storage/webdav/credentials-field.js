/**
 * Credentials of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
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
  isVisible: computed('parent.value.credentialsType', function isVisible() {
    const type = this.parent.value?.credentialsType;
    return type === 'basic' || type === 'oauth2';
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  label: computed('parent.value.credentialsType', function label() {
    const type = this.parent.value?.credentialsType;
    if (type === 'oauth2') {
      return this.getTranslation('labelOauth2');
    } else {
      return this.getTranslation('label');
    }
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  tip: computed('parent.value.credentialsType', function tip() {
    const type = this.parent.value?.credentialsType;
    let translationId;
    switch (type) {
      case 'oauth2':
        translationId = 'tipOauth2';
        break;
      case 'token':
        translationId = 'tipToken';
        break;
      case 'basic':
        translationId = 'tipBasic';
        break;
      default:
        translationId = 'tip';
    }
    return this.getTranslation(translationId);
  }),
});
