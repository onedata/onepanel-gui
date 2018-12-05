/**
 * A class for creating object that polls for auto-cleaning status
 * To use in space auto-cleaning components (`component:space-auto-cleaning`)
 *
 * @module utils/space-auto-cleaning-status-updater
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { assert } from '@ember/debug';
import DataWatcher from 'onepanel-gui/utils/data-watcher';

export default DataWatcher.extend({
  /**
   * @virtual
   * @type {Ember.Service} SpaceManager service
   */
  spaceManager: undefined,

  /**
   * @virtual
   * @type {string}
   */
  spaceId: undefined,

  /**
   * Updated by polling
   * @type {ComputedProperty<Onepanel.AutoCleaningStatus>}
   */
  status: reads('data'),

  /**
   * @override
   * @type {ComputedProperty<boolean>}
   */
  isFastPolling: reads('status.inProgress'),

  init() {
    this._super(...arguments);
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');

    assert(typeof spaceManager !== 'object',
      'spaceManager service should be injected');
    assert(typeof spaceId !== 'string', 'spaceId should be injected');
  },

  /**
   * @override
   */
  updateData() {
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');
    this.set('isUpdating', true);
    return spaceManager.getAutoCleaningStatus(spaceId)
      .then(autoCleaningStatus => {
        this.set('isUpdating', null);
        return this.set('data', autoCleaningStatus);
      })
      .catch(error => this.set('error', error))
      .finally(() => this.set('isUpdating', false));
  },
});
