import Ember from 'ember';

const {
  computed,
} = Ember;

/**
 * Creates component for displaying cluster storages.
 * 
 * @module components/cluster-storage-table.js
 * @author Michał Borzęcki
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  classNames: ['cluster-storage-table'],

  /**
   * @type {ObjectProxy.Array.ObjectProxy.Onepanel.StorageDetails}
   */
  storages: null,

  /**
   * @type {Array.ObjectProxy.Onepanel.SpaceDetails}
   */
  spaces: null,

  spacesLoadError: computed('spaces.@each.isRejected', function () {
    let spaces = this.get('spaces');
    if (spaces) {
      return spaces.some(s => s.get('isRejected'));
    }
  }),

  anyStorageRejected: computed('storages.content.@each.isRejected', function () {
    let storages = this.get('storages.content');
    if (storages) {
      return storages.some(s => s.get('isRejected'));
    }
  }),
});
