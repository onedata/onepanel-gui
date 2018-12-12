/**
 * Class that node block device used by Ceph OSD.
 * 
 * @module utils/ceph/node-device
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
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
  name: undefined,

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
  descriptiveName: computed('name', 'size', function descriptiveName() {
    const {
      name,
      size,
    } = this.getProperties('name', 'size');
    return `${name} (${bytesToString(size)})`;
  }),
});
