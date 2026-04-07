/**
 * Username of the storage.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { UsernameField as CommonUsernameField } from '../common/username-field';

export const UsernameField = CommonUsernameField.extend({
  /**
   * @override
   */
  isVisible: computed('parent.value.credentialsType', function isVisible() {
    const type = this.parent.value?.credentialsType;
    return type === 'pwd';
  }),
});
