/**
 * A component that displays a space import status as icon.
 *
 * @module components/space-status-icons
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not } from 'ember-awesome-macros';

function t(i18n, key) {
  return i18n.t('components.spaceStatusIcons.' + key);
}

export default Component.extend({
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
   * @type {Onepanel.AutoStorageImportStats}
   */
  importStats: null,

  storageImportEnabled: reads('space.storageImportEnabled'),

  importStatus: reads('importStats.status'),

  _noStatus: not('storageImportEnabled'),

  _importHint: computed('storageImportEnabled', 'importStatus', function () {
    let i18n = this.get('i18n');
    if (this.get('storageImportEnabled')) {
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
});
