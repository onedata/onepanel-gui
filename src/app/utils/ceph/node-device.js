/**
 * Class that represents node block device used by Ceph OSD.
 * 
 * @module utils/ceph/node-device
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

let nextCephNodeDeviceId = 0;

function getNextCephNodeDeviceId() {
  return String(nextCephNodeDeviceId++);
}

export default EmberObject.extend({
  /**
   * @type {string}
   * @virtual
   */
  path: undefined,

  /**
   * Size in bytes
   * @type {number}
   * @virtual
   */
  size: 0,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  id: computed(function id() {
    return getNextCephNodeDeviceId();
  }),

  /**
   * Name in format: [name] ([scaled size])
   * @type {Ember.ComputedProperty<string>}
   */
  descriptiveName: computed('path', 'size', function descriptiveName() {
    const {
      path,
      size,
    } = this.getProperties('path', 'size');
    return `${path} (${bytesToString(size)})`;
  }),
});
