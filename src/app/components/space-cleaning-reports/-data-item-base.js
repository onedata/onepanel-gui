/**
 * Base component for creating report items in desktop or mobile mode
 * 
 * @module space-cleaning-reports/-data-item-base
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['data-item-base'],

  i18n: service(),

  item: undefined,

  dataRowId: reads('item.id'),

  startedAt: computed('item.startedAt', function startedAt() {
    const value = this.get('item.startedAt');
    return value ? dateFormat([value], { format: 'report' }) : '-';
  }),

  stoppedAt: computed('item.stoppedAt', function stoppedAt() {
    const value = this.get('item.stoppedAt');
    return value ? dateFormat([value], { format: 'report' }) : '-';
  }),

  releasedSize: computed('item.{bytesToRelease,releasedSize}', function releasedSize() {
    const {
      i18n,
      item,
    } = this.getProperties('i18n', 'item');
    const released = bytesToString(get(item, 'releasedBytes'), { iecFormat: true });
    const outOf = i18n.t('components.spaceCleaningReports.releasedBytesOutOf');
    const planned = bytesToString(
      get(item, 'bytesToRelease'), { iecFormat: true }
    );
    return `${released} (${outOf} ${planned})`;
  }),

  filesNumber: reads('item.filesNumber'),
});
