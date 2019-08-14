/**
 * Generates unique ids for new Ceph OSDs.
 * 
 * @module utils/ceph/osd-id-generator
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default EmberObject.extend(createDataProxyMixin('nextIdFromBackend'), {
  cephManager: service(),

  /**
   * Next osd id. Initialized with real value by `nextIdFromBackendObserver`.
   * @type {number}
   */
  nextId: 0,

  nextIdFromBackendObserver: observer(
    'nextIdFromBackend',
    function nextIdFromBackendObserver() {
      const nextIdFromBackend = this.get('nextIdFromBackend');
      if (typeof nextIdFromBackend === 'number') {
        this.set('nextUniqeId', nextIdFromBackend);
      }
    }
  ),

  init() {
    this._super(...arguments);

    this.get('nextIdFromBackendProxy');
  },

  /**
   * @override
   */
  fetchNextIdFromBackend() {
    return this.get('cephManager').getNextOsdId();
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
