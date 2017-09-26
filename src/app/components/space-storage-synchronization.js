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
