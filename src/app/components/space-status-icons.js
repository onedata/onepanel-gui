/**
 * A component that displays a space import status as icon.
 *
 * @module components/space-status-icons
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not } from 'ember-awesome-macros';
import moment from 'moment';
import { reportFormatter } from 'onedata-gui-common/helpers/date-format';
import { htmlSafe } from '@ember/string';
import { isMissingMessage } from 'onedata-gui-common/utils/i18n/missing-message';

export function storageImportStatusDescription(i18n, space, importInfo) {
  const i18nPrefix = 'components.spaceStatusIcons.importStatus';
  const {
    storageImportEnabled,
    manualStorageImportEnabled,
  } = getProperties(space || {}, 'storageImportEnabled', 'manualStorageImportEnabled');
  const {
    status: importStatus,
    nextScan: nextScanTimestamp,
  } = getProperties(importInfo || {}, 'status', 'nextScan');

  if (!storageImportEnabled) {
    return;
  } else if (manualStorageImportEnabled) {
    return i18n.t(`${i18nPrefix}.manualMode`);
  } else {
    let translation = i18n.t(`${i18nPrefix}.${importStatus}`);
    if (isMissingMessage(translation)) {
      translation = i18n.t(`${i18nPrefix}.autoMode`);
    }

    let nextScanTimeString;
    if (
      nextScanTimestamp &&
      typeof nextScanTimestamp === 'number' &&
      nextScanTimestamp > 0
    ) {
      const nextScanMoment = moment.unix(nextScanTimestamp);
      const nowTimestamp = moment().unix();

      nextScanTimeString = nextScanTimestamp - nowTimestamp > 86400 ?
        nextScanMoment.format(reportFormatter) : nextScanMoment.format('H:mm:ss');
      translation = htmlSafe(`${String(translation)}${
        i18n.t(`${i18nPrefix}.nextScanPart`, { time: nextScanTimeString })
      }`);
    }

    return translation;
  }
}

export default Component.extend({
  classNames: ['space-status-icons'],
  classNameBindings: ['noStatus:hidden'],

  i18n: service(),

  /**
   * @virtual
   * @type {SpaceDetails}
   */
  space: null,

  /**
   * @virtual
   * @type {Onepanel.AutoStorageImportInfo}
   */
  importInfo: null,

  /**
   * @type {ComputedProperty<boolean>}
   */
  storageImportEnabled: reads('space.storageImportEnabled'),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  importStatus: reads('importInfo.status'),

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
      case 'completed':
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
   * @type {ComputedProperty<SafeString>}
   */
  importHint: computed(
    'space',
    'importInfo',
    function importHint() {
      const {
        space,
        importInfo,
        i18n,
      } = this.getProperties('space', 'importInfo', 'i18n');

      return storageImportStatusDescription(i18n, space, importInfo);
    }
  ),
});
