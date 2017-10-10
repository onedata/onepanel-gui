/**
 * Space storage synchronization statistics container
 * Mainly used in space storage synchronization tab
 *
 * @module components/space-storage-synchronization
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

export default Component.extend({
  /**
   * @virtual
   * @type {Function}
   */
  syncIntervalChanged: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual 
   * @type {string}
   */
  syncInterval: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {boolean}
   */
  timeStatsLoading: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {boolean}
   */
  statsFrozen: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {string}
   */
  timeStatsError: undefined,

  /**
   * See `mixins/components/space-item-sync-stats`
   * @virtual
   * @type {Array<object>}
   */
  timeStats: undefined,
});
