/**
 * NFS version field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';

export const NfsVersionField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'version',

  /**
   * @override
   */
  options: Object.freeze([
    { value: '3' },
    { value: '4' },

  ]),

  /**
   * @override
   */
  defaultValue: '3',
});
