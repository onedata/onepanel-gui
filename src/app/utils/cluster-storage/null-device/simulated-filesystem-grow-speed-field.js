/**
 * Simulated filesystem grow speed field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { StorageNumberField } from '../base/storage-number-field';

export const SimulatedFilesystemGrowSpeedField = StorageNumberField.extend({
  /**
   * @override
   */
  name: 'simulatedFilesystemGrowSpeed',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  gte: 0,

  /**
   * @type {ComputedProperty<boolean>}
   */
  importedStorage: reads('parent.parent.value.basic.importedStorage'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEnabled: reads('importedStorage'),

  autoSettings() {
    if (!this.importedStorage) {
      this.valueChanged(null);
    }
  },
});
