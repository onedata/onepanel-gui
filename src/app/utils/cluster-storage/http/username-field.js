/**
 * Username of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { UsernameField as CommonUsernameField } from '../common/username-field';
import { reads } from '@ember/object/computed';

export const UsernameField = CommonUsernameField.extend({
  /**
   * @override
   */
  isEnabled: computed('mode', 'isEnabledForAdditionalButton', function isEnabled() {
    return this.isEnabledForAdditionalButton || this.mode !== 'edit';
  }),

  /**
   * @type {boolean}
   */
  isEnabledForAdditionalButton: reads('context.component.isCredentialsEnabled'),

  inputType: computed('isEnabled', function inputType() {
    return this.isEnabled ? 'text' : 'password';
  }),

  resetValue() {
    this.valueChanged(null);
  },
});
