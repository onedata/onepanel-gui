/**
 * Base class for radio fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RadioField from 'onedata-gui-common/utils/form-component/radio-field';
import computedMode from './computed-mode';

export const StorageRadioField = RadioField.extend({
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
