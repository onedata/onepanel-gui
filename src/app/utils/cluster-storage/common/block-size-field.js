/**
 * Block size field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const BlockSizeField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'blockSize',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  notEditable: true,

  /**
   * @override
   */
  gt: 0,

  autoSettings() {
    return;
  },
});
