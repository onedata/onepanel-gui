/**
 * Volume transport field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageRadioField } from '../base/storage-radio-field';

export const TransportField = StorageRadioField.extend({
  /**
   * @override
   */
  name: 'transport',

  /**
   * @override
   */
  options: Object.freeze([
    { value: 'tcp' },
    { value: 'rdma' },
    { value: 'socket' },
  ]),

  /**
   * @override
   */
  defaultValue: 'tcp',
});
