/**
 * A base component for building a sidebar view with two-level list
 *
 * @module components/two-level-sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  inject: {
    service
  },
  computed: {
    readOnly
  },
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['two-level-sidebar'],

  sidebar: service(),
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  model: null,

  /**
   * Name of oneicon that should be displayed for each first-level element
   * To inject.
   * 
   * @type {string}
   */
  firstLevelItemIcon: null,

  resourceType: readOnly('model.resourceType'),

  isCollectionEmpty: computed.equal('model.collection.length', 0),

  primaryItemId: computed('sidebar.itemPath.[]', function () {
    return this.get('sidebar.itemPath').objectAt(0);
  }),

  secondaryItemId: computed('sidebar.itemPath.[]', function () {
    return this.get('sidebar.itemPath').objectAt(1);
  }),
  
  actions: {
    changePrimaryItemId(itemId) {
      let resourceType = this.get('resourceType');

      this.sendAction('changeResourceId', resourceType, itemId);
    }
  },

  // TODO only for cluster-specific - make more generic

});
