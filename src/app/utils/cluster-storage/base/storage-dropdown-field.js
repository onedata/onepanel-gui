/**
 * Base class for dropdown fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import computedMode from './computed-mode';

export const StorageDropdownField = DropdownField.extend({
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
