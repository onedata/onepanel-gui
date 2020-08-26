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

  /**
   * @type {ComputedProperty<String>}
   */
  importStatusIconClasses: computed('importStatus', function importStatusIconClasses() {
    const animationClassesBase = 'animated infinite semi-hinge';
    switch (this.get('importStatus')) {
      case 'initializing':
      case 'running':
        return `${animationClassesBase} pulse-mint`;
      case 'aborting':
        return `${animationClassesBase} pulse-orange`;
      case 'done':
        return 'text-success';
      case 'failed':
        return 'text-danger';
      case 'aborted':
        return 'text-danger';
      default:
        return '';
    }
  }),

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
