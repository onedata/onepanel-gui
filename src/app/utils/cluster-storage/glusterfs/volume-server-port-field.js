/**
 * Volume server port of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageNumberField } from '../base/storage-number-field';

export const VolumeServerPortField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'port',

  /**
   * @override
   */
  isOptional: true,
});
