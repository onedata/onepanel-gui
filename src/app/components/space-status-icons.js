import Ember from 'ember';

const {
  computed,
  computed: { readOnly },
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

  importEnabled: readOnly('space.importEnabled'),
  updateEnabled: readOnly('space.updateEnabled'),

  importStatus: readOnly('syncStats.importStatus'),
  updateStatus: readOnly('syncStats.updateStatus'),

  _noStatus: computed('importEnabled', 'updateEnabled', function () {
    return !this.get('importEnabled') && !this.get('updateEnabled');
  }),

  _importHint: computed('importEnabled', 'importStatus', function () {
    if (this.get('importEnabled')) {
      switch (this.get('importStatus')) {
      case 'inProgress':
        return 'Data import: in progress...';
      case 'done':
        return 'Data import: done!';
      default:
        return 'Data import: enabled';
      }
    } else {
      return 'Import disabled';
    }
  }),

  _updateHint: computed('updateEnabled', 'updateStatus', function () {
    if (this.get('updateEnabled')) {
      switch (this.get('updateStatus')) {
      case 'inProgress':
        return 'Data update: in progress...';
      case 'waiting':
        return 'Data update: idle';
      default:
        return 'Data update: enabled';
      }
    } else {
      return 'Update disabled';
    }
  }),
});
