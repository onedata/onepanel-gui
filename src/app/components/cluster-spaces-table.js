/**
 * Lists supported spaces
 *
 * @module components/cluster-spaces-table.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  computed,
} = Ember;

export default Component.extend({
  /**
   * @type {Array.SpaceDetails}
   */
  spaces: null,

  anySpaceRejected: computed('spaces', function () {
    let spaces = this.get('spaces');
    return spaces.some(s => s.get('isRejected'));
  }),

  actions: {
    revokeSpace(space) {
      return invokeAction(this, 'revokeSpace', space);
    },
    closeRejectedError() {
      this.set('anySpaceRejected', false);
    }
  },
});
