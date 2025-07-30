/**
 * Verify server cert. field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageToggleField } from '../base/storage-toggle-field';

export const VerifyServerCertField = StorageToggleField.extend({
  /**
   * @override
   */
  name: 'verifyServerCert',

  /**
   * @override
   */
  defaultValue: true,
});
