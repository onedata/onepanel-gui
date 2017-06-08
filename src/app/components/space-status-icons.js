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

  /**
   * To inject.
   * @type {Onepanel.SpaceSyncStats}
   */
  syncStats: null,

  importEnabled: alias('space.importEnabled'),
  updateEnabled: alias('space.updateEnabled'),

  _noStatus: computed('importEnabled', 'updateEnabled', function () {
    return !this.get('importEnabled') && !this.get('updateEnabled');
  }),

  _importHint: computed('importEnabled', 'syncStats.importStatus', function () {
    if (this.get('importEnabled')) {
      switch (this.get('syncStats.importStatus')) {
      case 'inProgress':
        return 'Data import: in progress...';
      case 'done':
        return 'Data import: done!';
      default:
        break;
      }
    } else {
      return 'Import disabled';
    }
  }),

  _updateHint: computed('updateEnabled', 'syncStats.updateStatus', function () {
    if (this.get('updateEnabled')) {
      switch (this.get('syncStats.updateStatus')) {
      case 'inProgress':
        return 'Data update: in progress...';
      case 'waiting':
        return 'Data update: idle';
      default:
        break;
      }
    } else {
      return 'Update disabled';
    }
  }),
});
