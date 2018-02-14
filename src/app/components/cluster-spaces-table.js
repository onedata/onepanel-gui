/**
 * Lists supported spaces
 *
 * @module components/cluster-spaces-table.js
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { get, computed } from '@ember/object';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend({
  classNames: ['cluster-spaces-table'],

  /**
   * @virtual
   * @type {function}
   */
  modifySpace: notImplementedReject,

  /**
   * @virtual
   * @type {function}
   */
  revokeSpace: notImplementedReject,

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
      return this.get('revokeSpace')(space);
    },
    closeRejectedError() {
      this.set('anySpaceRejected', false);
    },
    submitModifySpace(space, data) {
      return this.get('modifySpace')(space, data);
    },
  },
});
