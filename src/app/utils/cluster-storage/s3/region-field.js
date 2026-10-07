/**
 * Region field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';

export const RegionField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'region',

  /**
   * @type {ComputedProperty<string>}
   */
  hostname: reads('parent.parent.value.s3.hostname'),

  /**
   * @override
   */
  isOptional: computed('hostname', function isOptional() {
    if (
      !this.hostname ||
      (!this.hostname.startsWith('https://') && !this.hostname.startsWith('http://'))
    ) {
      return true;
    }
    try {
      const url = new URL(this.hostname);
      return url.hostname.toLowerCase() !== 's3.amazonaws.com';
    } catch {
      return true;
    }
  }),
});
