/**
 * Base class for number fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import computedMode from './computed-mode';
import computedIsVisible from './computed-is-visible';

export const StorageNumberField = NumberField.extend({
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

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isVisible: computedIsVisible(),
});
