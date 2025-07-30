/**
 * Base class for radio fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import { computed } from '@ember/object';

export const StorageRadioField = RadioField.extend({
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
