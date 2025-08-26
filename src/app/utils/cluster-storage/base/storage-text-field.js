/**
 * Base class for text fields used in cluster storage forms.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TextField from 'onedata-gui-common/utils/form-component/text-field';
import computedMode from './computed-mode';
import computedIsVisible from './computed-is-visible';

export const StorageTextField = TextField.extend({
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
