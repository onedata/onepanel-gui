/**
 * LUMA feed field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';

export const LUMAFeedField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'lumaFeed',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'auto' },
    { value: 'local' },
    { value: 'external' },

  ]),

  /**
   * @override
   */
  defaultValue: 'auto',
});
