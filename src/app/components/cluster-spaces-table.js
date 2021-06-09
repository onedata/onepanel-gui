/**
 * Lists supported spaces
 *
 * @module components/cluster-spaces-table.js
 * @author Jakub Liput
 * @copyright (C) 2017-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { get, computed } from '@ember/object';
import { sort } from '@ember/object/computed';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  navigationState: service(),

  classNames: ['cluster-spaces-table'],

  i18nPrefix: 'components.clusterSpacesTable',

  /**
   * @virtual
   * @type {function}
   */
  startRevokeSpace: notImplementedReject,

  /**
   * @type {SpaceDetails[]|Ember.ArrayProxy<SpaceDetails>}
   */
  spaces: null,

  sorting: Object.freeze(['name:asc']),

  spacesSorted: sort('spaces', 'sorting'),

  anySpaceRejected: computed('spaces.content', function () {
    let spaces = this.get('spaces');
    if (spaces) {
      return (get(spaces, 'content') || spaces).some(s => get(s, 'isRejected'));
    }
  }),

  actions: {
    startRevokeSpace(space) {
      return this.get('startRevokeSpace')(space);
    },
    closeRejectedError() {
      this.set('anySpaceRejected', false);
    },
    spaceClicked(spaceId) {
      return this.get('navigationState').changeRouteAspectOptions({
        space: spaceId,
        tab: 'overview',
      });
    },
  },
});
