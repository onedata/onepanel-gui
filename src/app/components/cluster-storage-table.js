import Component from '@ember/component';
import { computed } from '@ember/object';
import { array } from 'ember-awesome-macros';

/**
 * Creates component for displaying cluster storages.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  classNames: ['cluster-storage-table'],

  /**
   * @virtual
   * @type {Ember.ArrayProxy<Ember.ObjectProxy<Onepanel.StorageGetDetails>>}
   */
  storages: null,

  /**
   * @virtual
   * @type {Array<PromiseUpdatedObject<OnepanelGui.SpaceDetails>>}
   */
  spaces: null,

  spacesLoadError: computed('spaces.@each.isRejected', function () {
    const spaces = this.get('spaces');
    if (spaces) {
      return spaces.some(s => s.get('isRejected'));
    }
  }),

  anyStorageRejected: computed('storages.content.@each.isRejected', function () {
    const storages = this.get('storages.content');
    if (storages) {
      return storages.some(s => s.get('isRejected'));
    }
  }),
});
