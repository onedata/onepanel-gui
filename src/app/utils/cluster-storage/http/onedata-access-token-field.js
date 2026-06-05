/**
 * Onedata access token of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export const OnedataAccessTokenField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'credentials',

  /**
   * @override
   */
  isEnabled: computed(
    'context.component.mode',
    'isEnabledForAdditionalButton',
    function isEnabled() {
      return this.isEnabledForAdditionalButton || this.context.component.mode !== 'edit';
    }
  ),

  /**
   * @type {boolean}
   */
  isEnabledForAdditionalButton: reads('context.component.isCredentialsEnabled'),

  /**
   * @override
   */
  isVisible: computed('parent.value.credentialsType', function isVisible() {
    const type = this.parent.value?.credentialsType;
    return type === 'token';
  }),

  resetValue() {
    this.valueChanged(null);
  },
});
