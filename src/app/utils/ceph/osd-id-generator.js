/**
 * Generates unique ids for new Ceph OSDs.
 * 
 * @module utils/ceph/osd-id-generator
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default EmberObject.extend({
  cephManager: service(),

  /**
   * Next osd id. Initialized with real value by init and nextIdObserver.
   * @type {number}
   */
  nextId: 0,

  /**
   * @type {Ember.ComputedProperty<PromiseObject<number>>}
   */
  nextIdProxy: computed(function loadingProxy() {
    return this.get('cephManager').getNextOsdId();
  }),

  nextIdObserver: observer('nextIdProxy.content', function nextIdObserver() {
    const fetchedNextId = this.get('nextIdProxy.content');
    if (typeof fetchedNextId === 'number') {
      this.set('nextId', fetchedNextId);
    }
  }),

  init() {
    this._super(...arguments);

    // load nextId
    this.get('nextIdProxy');
  },

  /**
   * @returns {number}
   */
  getNextId() {
    const nextId = this.get('nextId');
    this.set('nextId', nextId + 1);
    return nextId;
  },
});
