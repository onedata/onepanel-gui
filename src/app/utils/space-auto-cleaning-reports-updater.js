/**
 * A class for creating object that polls for auto-cleaning reports
 * To use in space auto-cleaning components (`component:space-auto-cleaning`)
 *
 * @module utils/space-auto-cleaning-reports-updater
 * @author Jakub Liput
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, set, observer } from '@ember/object';
import { run } from '@ember/runloop';
import { assert } from '@ember/debug';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import pushNewItems from 'onedata-gui-common/utils/push-new-items';
import { alias } from '@ember/object/computed';
import DataWatcher from 'onedata-gui-common/utils/data-watcher';

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
   * How many reports should be fetched from list start on update
   * @virtual optional
   * @type {number}
   */
  reportsNumber: 50,

  /**
   * @virtual
   * @type {ReplacingChunksArray}
   */
  replacingArray: undefined,

  /**
   * Collection of cleaning reports
   * Updated by polling
   * @type {EmberArray<Onepanel.SpaceAutoCleaningReport>}
   */
  data: alias('replacingArray.sourceArray'),

  /**
   * @virtual
   * @type {function}
   * @returns {number} -1, 0 or 1
   */
  sortFun: undefined,

  /**
   * @override
   */
  isFastPolling: true,

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

  destroy() {
    try {
      this.set('_interval', undefined);
      this.get('_watcher').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  _reconfigureWatcher: observer(
    '_interval',
    function _reconfigureWatcher() {
      // debouncing does not let _setCleanWatchersIntervals to be executed multiple
      // times, which can occur for observer
      run.debounce(this, '_setWatcherInterval', 1);
    }
  ),

  // TODO: there should be no watcher for reports at all - it should be updated:
  // - after enabling
  // - on change status.inProgress true -> false

  _setWatcherInterval() {
    // this method is invoked from debounce, so it's this can be destroyed
    if (this.isDestroyed === false) {
      const {
        _interval,
        _watcher,
      } = this.getProperties(
        '_interval',
        '_watcher',
      );
      set(_watcher, 'interval', _interval);
    }
  },

  /**
   * @override
   */
  updateData() {
    const {
      spaceManager,
      spaceId,
      reportsNumber,
      sortFun,
    } = this.getProperties('spaceManager', 'spaceId', 'reportsNumber', 'sortFun');
    this.set('isUpdating', true);
    return spaceManager.getAutoCleaningReports(
        spaceId,
        null,
        reportsNumber,
        0,
      )
      .then(reportEntries => safeExec(this, function () {
        this.set('cleanReportsError', null);
        const sourceArray = this.get('data');
        pushNewItems(
          sourceArray,
          reportEntries,
          (x, y) => get(x, 'id') === get(y, 'id')
        );
        const replacingArray = this.get('replacingArray');
        replacingArray.notifyPropertyChange('firstObject');
        replacingArray.notifyPropertyChange('lastObject');
        replacingArray.notifyPropertyChange('[]');
        if (sortFun) {
          sourceArray.sort(sortFun);
        }
        return sourceArray;
      }))
      .catch(error => safeExec(this, function () {
        this.set('error', error);
      }))
      .finally(() => safeExec(this, function () {
        this.set('isUpdating', false);
      }));
  },

});
