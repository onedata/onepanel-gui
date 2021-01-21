import Component from '@ember/component';
import { computed } from '@ember/object';
import { array } from 'ember-awesome-macros';

/**
 * Creates component for displaying cluster storages.
 * 
 * @module components/cluster-storage-table.js
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['cluster-storage-table'],

  /**
   * @virtual
   * @type {ObjectProxy.Array.ObjectProxy.Onepanel.StorageDetails}
   */
  storages: null,

  /**
   * @virtual
   * @type {Array<PromiseUpdatedObject<OnepanelGui.SpaceDetails>>}
   */
  spaces: null,

  /**
   * @type {ComputedProperty<Array<PromiseObject<StorageDetails>>>}
   */
  storagesSorted: array.sort('storages', ['name', 'conflictLabel']),

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
