/**
 * Base class for toggle fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { computed } from '@ember/object';

export const StorageToggleField = ToggleField.extend({
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
});
