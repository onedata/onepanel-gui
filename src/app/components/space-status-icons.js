/**
 * A component that displays a space import/update status as icons.
 *
 * @module components/space-status-icons
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  computed,
  computed: { readOnly },
  inject: { service },
} = Ember;

function t(i18n, key) {
  return i18n.t('components.spaceStatusIcons.' + key);
}

export default Ember.Component.extend({
  classNames: ['space-status-icons'],
  classNameBindings: ['_noStatus:hidden'],

  i18n: service(),

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
    let i18n = this.get('i18n');
    if (this.get('importEnabled')) {
      switch (this.get('importStatus')) {
      case 'inProgress':
        return `${t(i18n, 'dataImport')}: ${t(i18n, 'inProgress')}`;
      case 'done':
        return `${t(i18n, 'dataImport')}: ${t(i18n, 'done')}`;
      default:
        return `${t(i18n, 'dataImport') }: ${t(i18n, 'enabled')}`;
      }
    }
  }),

  _updateHint: computed('updateEnabled', 'updateStatus', function () {
    let i18n = this.get('i18n');
    if (this.get('updateEnabled')) {
      switch (this.get('updateStatus')) {
      case 'inProgress':
        return `${t(i18n, 'dataUpdate')}: ${t(i18n, 'working')}`;
      case 'waiting':
        // showing "enabled" hint also for waiting to not confuse user
        return `${t(i18n, 'dataUpdate') }: ${t(i18n, 'enabled')}`;
      }
    }
  }),
});
