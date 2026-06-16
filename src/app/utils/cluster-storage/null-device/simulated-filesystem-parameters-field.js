/**
 * Simulated filesystem parameters field of the storage.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { StorageTextField } from '../base/storage-text-field';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';

export const SimulatedFilesystemParametersField = StorageTextField.extend({
  /**
   * @override
   */
  name: 'simulatedFilesystemParameters',

  /**
   * @override
   */
  isOptional: true,

  /**
   * @override
   */
  regex: /^(\d+-\d+(:\d+-\d+)*(:\d+)?)?$/,

  /**
   * @type {boolean}
   */
  importedStorage: reads('parent.parent.value.basic.importedStorage'),

  /**
   * @type {boolean}
   */
  isEnabled: reads('importedStorage'),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  lockHint: computed(function lockHint() {
    return this.t('nulldevice.simulatedFilesystemParameters.lockHint');
  }),

  autoSettings() {
    if (!this.importedStorage) {
      this.valueChanged(null);
    }
  },
});
