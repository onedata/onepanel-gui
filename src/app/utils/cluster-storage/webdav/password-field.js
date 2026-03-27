/**
 * Password of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';
import { computed } from '@ember/object';

export const PasswordField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'password',

  /**
   * @override
   */
  inputType: 'password',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @override
   */
  isVisible: computed('parent.value.credentialsType', function isVisible() {
    const type = this.parent.value?.credentialsType;
    return type === 'basic';
  }),
});
