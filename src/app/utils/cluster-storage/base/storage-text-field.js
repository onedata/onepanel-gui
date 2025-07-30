/**
 * Base class for text fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { computed } from '@ember/object';

export const StorageTextField = TextField.extend({
  /**
   * @virtual
   */
  context: undefined,

  mode: computed('context.component.mode', function mode() {
    if (this.context.component.mode === 'show') {
      return 'view';
    } else {
      return 'edit';
    }
  }),

  isVisible: computed('value', 'mode', function isVisible() {
    return this.mode === 'edit' ||
      (
        this.value !== null &&
        this.value !== undefined &&
        this.value !== ''
      );
  }),
});
