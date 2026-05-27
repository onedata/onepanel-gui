/**
 * Password of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { PasswordField as CommonPasswordField } from '../common/password-field';
import { reads } from '@ember/object/computed';

export const PasswordField = CommonPasswordField.extend({
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

  resetValue() {
    this.valueChanged(null);
  },
});
