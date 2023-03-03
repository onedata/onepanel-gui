/**
 * A class for creating object that polls for auto-cleaning status
 * To use in space auto-cleaning components (`component:space-auto-cleaning`)
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import DataWatcher from 'onedata-gui-common/utils/data-watcher';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { raw, eq, or } from 'ember-awesome-macros';

export default DataWatcher.extend({
  /**
   * @virtual
   * @type {Ember.Service} SpaceManager service
   */
  spaceManager: service(),

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
  isFastPolling: or(
    eq('status.lastRunStatus', raw('active')),
    eq('status.lastRunStatus', raw('cancelling')),
  ),

  init() {
    this._super(...arguments);
    const {
      spaceManager,
      spaceId,
    } = this.getProperties('spaceManager', 'spaceId');

    assert(typeof spaceManager !== 'object',
      'spaceManager service should be injected or auto-injected');
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
        safeExec(this, 'set', 'isUpdating', null);
        return safeExec(this, 'set', 'data', autoCleaningStatus);
      })
      .catch(error => safeExec(this, 'set', 'error', error))
      .finally(() => safeExec(this, 'set', 'isUpdating', false));
  },
});
