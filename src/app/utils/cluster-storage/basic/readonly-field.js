/**
 * Readonly info field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageToggleField } from '../base/storage-toggle-field';

export const ReadonlyField = StorageToggleField.extend({
  /**
   * @override
   */
  name: 'readonly',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  valueChanged() {
    this._super(...arguments);
    this.context.component.readonlyChanged();
  },
});
