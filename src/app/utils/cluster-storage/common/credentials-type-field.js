/**
 * Credentials type field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export const CredentialsTypeField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'credentialsType',

  /**
   * @override
   */
  defaultValue: 'none',

  /**
   * @type {boolean}
   */
  hasAdditionalButton: computed('context.component.mode', function hasAdditionalButton() {
    return this.context.component.mode === 'edit';
  }),

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
   * @type {ComputedProperty<Object>}
   */
  additionalButtonConfig: computed(
    'parent.parent.value.basic.type',
    function additionalButtonConfig() {
      const type = this.parent.parent.value.basic.type;
      return {
        name: this.t(`${type}.credentialsType.additionalButton.name`),
        tooltip: this.t(`${type}.credentialsType.additionalButton.tooltip`),
        icon: 'browser-rename',
        buttonAction: () => this.onEditCredentials(),
      };
    }
  ),
});
