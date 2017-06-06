import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * To inject.
   * @type {ProviderSpaceSyncStats}
   */
  syncStats: null,

  init() {
    this._super(...arguments);
  },

});
