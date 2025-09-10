/**
 * A function that provides `isVisible` property computed from `value` and `mode`
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function computedIsVisible() {
  return computed('value', 'mode', function isVisible() {
    return this.mode === 'edit' || (
      this.value !== null &&
      this.value !== undefined &&
      this.value !== ''
    );
  });
}
