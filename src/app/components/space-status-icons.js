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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import moment from 'moment';
import { reportFormatter } from 'onedata-gui-common/helpers/date-format';
import { htmlSafe } from '@ember/string';

export default Component.extend(I18n, {
  classNames: ['space-status-icons'],
  classNameBindings: ['noStatus:hidden'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.spaceStatusIcons',

  /**
   * @virtual
   * @type {SpaceDetails}
   */
  space: null,

  /**
   * @virtual
   * @type {Onepanel.AutoStorageImportStats}
   */
  importStats: null,

  /**
   * @type {ComputedProperty<boolean>}
   */
  storageImportEnabled: reads('space.storageImportEnabled'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  manualStorageImportEnabled: reads('space.manualStorageImportEnabled'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  importStatus: reads('importStats.status'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  noStatus: not('storageImportEnabled'),

  /**
   * @type {ComputedProperty<String>}
   */
  importStatusIconClasses: computed('importStatus', function importStatusIconClasses() {
    const animationClassesBase = 'animated infinite semi-hinge';
    switch (this.get('importStatus')) {
      case 'enqueued':
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

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  nextScanTimeString: computed('importStats.nextScan', function nextScanDateString() {
    const nextScanTimestamp = this.get('importStats.nextScan');
    if (
      !nextScanTimestamp ||
      typeof nextScanTimestamp !== 'number' ||
      nextScanTimestamp < 0
    ) {
      return;
    }

    const nextScanMoment = moment.unix(nextScanTimestamp);
    const nowTimestamp = moment().unix();

    if (nextScanTimestamp - nowTimestamp > 86400) {
      return nextScanMoment.format(reportFormatter);
    } else {
      return nextScanMoment.format('H:mm:ss');
    }
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  importHint: computed(
    'storageImportEnabled',
    'manualStorageImportEnabled',
    'importStatus',
    'nextScanTimeString',
    function importHint() {
      const {
        storageImportEnabled,
        manualStorageImportEnabled,
        importStatus,
        nextScanTimeString,
      } = this.getProperties(
        'storageImportEnabled',
        'manualStorageImportEnabled',
        'importStatus',
        'nextScanTimeString'
      );

      const hintPrefix = 'importStatus';
      if (!storageImportEnabled) {
        return;
      } else if (manualStorageImportEnabled) {
        return this.t(`${hintPrefix}.manualMode`);
      } else {
        let translation = this.t(`${hintPrefix}.${importStatus}`, {}, {
          defaultValue: this.t(`${hintPrefix}.autoMode`),
        });

        if (nextScanTimeString) {
          translation = htmlSafe(`${String(translation)}<br>${
            this.t(`${hintPrefix}.nextScan`, { time: nextScanTimeString })
          }`);
        }

        return translation;
      }
    }
  ),
});
