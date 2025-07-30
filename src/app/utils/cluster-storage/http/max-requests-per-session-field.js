/**
 * Max requests per session field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const MaxRequestsPerSessionField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'maxRequestsPerSession',

  /**
   * @override
   */
  isOptional: true,

  gte: 0,

  integer: true,
});
