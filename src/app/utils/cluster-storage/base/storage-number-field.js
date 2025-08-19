/**
 * Base class for number fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import { computed } from '@ember/object';

export const StorageNumberField = NumberField.extend({
  /**
   * @virtual
   */
  context: undefined,

  /**
   * @type {boolean}
   */
  notEditable: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  addOptionalTextToLabel: computed('context.component.mode',
    function addOptionalTextToLabel() {
      return this.context.component.mode !== 'show';
    }
  ),

  /**
   * Form mode. Available values: view, edit
   * @type {string}
   */
  mode: computed('context.component.mode', function mode() {
    if (this.context.component.mode === 'show' ||
      (this.context.component.mode === 'edit' &&
        this.notEditable)
    ) {
      return 'view';
    } else {
      return 'edit';
    }
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computed('value', 'mode', function isVisible() {
    return this.mode === 'edit' || (
      this.value !== null &&
      this.value !== undefined &&
      this.value !== ''
    );
  }),
});
