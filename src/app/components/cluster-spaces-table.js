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
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

const {
  Component,
  computed,
  get,
} = Ember;

export default Component.extend({
  /**
   * @virtual
   * @type {function}
   */
  modifySpace: notImplementedReject,

  /**
   * @type {SpaceDetails[]|Ember.ArrayProxy<SpaceDetails>}
   */
  spaces: null,

  anySpaceRejected: computed('spaces.content', function () {
    let spaces = this.get('spaces');
    if (spaces) {
      return (get(spaces, 'content') || spaces).some(s => get(s, 'isRejected'));
    }
  }),

  actions: {
    revokeSpace(space) {
      return invokeAction(this, 'revokeSpace', space);
    },
    closeRejectedError() {
      this.set('anySpaceRejected', false);
    },
    submitModifySpace(space, data) {
      return this.get('modifySpace')(space, data);
    },
  },
});
