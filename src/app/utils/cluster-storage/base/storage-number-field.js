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

  notEditable: false,

  addOptionalTextToLabel: computed('context.component.mode',
    function addOptionalTextToLabel() {
      return this.context.component.mode !== 'show';
    }
  ),

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

  // defaultValue: undefined,

  isVisible: computed('value', 'mode', function isVisible() {
    return this.mode === 'edit' || (
      this.value !== null &&
      this.value !== undefined &&
      this.value !== ''
    );
  }),
});
