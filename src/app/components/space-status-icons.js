import Ember from 'ember';

const {
  computed,
  computed: { alias },
} = Ember;

export default Ember.Component.extend({
  classNames: ['space-status-icons', 'status-toolbar'],
  classNameBindings: ['_noStatus:hidden'],

  /**
   * To inject.
   * @type {SpaceDetails}
   */
  space: null,

  // FIXME space._syncStats should not be marked private  
  syncStats: alias('space._syncStats'),
  importEnabled: alias('space.importEnabled'),
  updateEnabled: alias('space.updateEnabled'),

  _noStatus: computed('importEnabled', 'updateEnabled', function () {
    return !this.get('importEnabled') && !this.get('updateEnabled');
  }),

  _importIconClass: computed('importEnabled', function () {
    return !this.get('importEnabled') ? 'hidden' : '';
  }),

  _updateIconClass: computed('updateEnabled', function () {
    return !this.get('updateEnabled') ? 'hidden' : '';
  }),
});
