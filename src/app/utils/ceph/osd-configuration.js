/**
 * Class that represents OSD service parameters.
 * 
 * @module utils/ceph/osd-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set, get, setProperties } from '@ember/object';

const osdFields = [
  'id',
  'uuid',
  'type',
  'device',
  'path',
  'size',
];

export default EmberObject.extend({
  /**
   * @type {Utils/Ceph/NodeConfiguration}
   * @virtual
   */
  node: undefined,

  /**
   * @type {number}
   */
  id: undefined,

  /**
   * @type {string}
   */
  uuid: undefined,

  /**
   * One of `loopdevice`, `blockdevice`
   * @type {string}
   * @virtual
   */
  type: undefined,

  /**
   * @type {string}
   * @virtual
   * Only when type is `blockdevice`
   */
  device: undefined,

  /**
   * @type {string}
   * @virtual
   * Only when type is `loopdevice`
   */
  path: undefined,

  /**
   * @type {number}
   * @virtual
   * Only when type is `loopdevice`
   */
  size: undefined,

  /**
   * If true then osd config is valid
   * @type {boolean}
   */
  isValid: true,

  /**
   * Fills in configuration with given data.
   * @param {Object} newConfig 
   * @param {boolean} isValid
   * @returns {undefined}
   */
  fillIn(newConfig, isValid) {
    const propsToChange = {};
    if (newConfig) {
      osdFields.forEach(fieldName => {
        const newValue = get(newConfig, fieldName);
        if (this.get(fieldName) !== newValue) {
          propsToChange[fieldName] = newValue;
        }
      });
    }
    if (isValid !== undefined && this.get('isValid') !== isValid) {
      propsToChange.isValid = isValid;
    }
    this.setProperties(propsToChange);
  },

  /**
   * Creates raw object with configuration data. It is compatible with format
   * used by backend.
   * @returns {Object}
   */
  toRawConfig() {
    const {
      id,
      uuid,
      type,
      device,
      path,
      size,
    } = this.getProperties(...osdFields);
    const config = {
      id,
      uuid,
      host: this.get('node.host'),
      type,
    };
    switch (type) {
      case 'blockdevice':
        set(config, 'device', device);
        break;
      case 'loopdevice':
        setProperties(config, {
          path,
          size,
        });
        break;
    }
    return config;
  },
});
