/**
 * FIXME 
 *
 * @module components/storage-import-update-form
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction, invoke } from 'ember-invoke-action';

export default Ember.Component.extend({
  /**
   * @type {boolean}
   */
  submitButton: false,

  formValues: {
    storageImport: {
      strategy: 'simple_scan',
      maxDepth: 100,
    },
    storageUpdate: {
      strategy: 'simple_scan',
      maxDepth: 120,
      scanInterval: 100,
      writeOnce: true,
      deleteEnable: true,
    },
  },

  // FIXME only mocking valuesChanged
  didInsertElement() {
    invoke(this, 'valuesChanged');
  },

  actions: {
    valuesChanged() {
      return invokeAction(this, 'valuesChanged');
    },
    submit() {
      return invokeAction(this, 'submit', this.get('formValues'));
    },
  },
});
