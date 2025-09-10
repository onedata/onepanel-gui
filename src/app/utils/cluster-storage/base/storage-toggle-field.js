/**
 * Base class for toggle fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import computedMode from './computed-mode';

export const StorageToggleField = ToggleField.extend({
  /**
   * @virtual
   * @type {ClusterStorageAddFormContext}
   */
  context: undefined,

  /**
   * @type {boolean}
   */
  notEditable: false,

  /**
   * Form mode.
   * @type {'view'|'edit'}
   */
  mode: computedMode(),
});
