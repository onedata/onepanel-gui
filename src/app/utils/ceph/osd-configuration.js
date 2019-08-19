/**
 * Class that represents OSD service parameters.
 * 
 * @module utils/ceph/osd-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set, get } from '@ember/object';

const osdFields = [
  'id',
  'type',
  'device',
  'dbDevice',
  'path',
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
   * One of `filestore`, `bluestore`
   * @type {string}
   * @virtual
   */
  type: undefined,

  /**
   * @type {string}
   * @virtual
   */
  device: undefined,

  /**
   * @type {string}
   * @virtual
   */
  dbDevice: undefined,

  /**
   * @type {string}
   * @virtual
   */
  path: undefined,

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
          set(propsToChange, fieldName, newValue);
        }
      });
    }
    if (isValid !== undefined && this.get('isValid') !== isValid) {
      set(propsToChange, 'isValid', isValid);
    }
    if (get(Object.keys(propsToChange), 'length') > 0) {
      this.setProperties(propsToChange);
    }
  },

  /**
   * Creates raw object with configuration data. It is compatible with format
   * used by backend.
   * @returns {Object}
   */
  toRawConfig() {
    const {
      id,
      type,
      device,
      dbDevice,
      path,
    } = this.getProperties(...osdFields);
    const config = {
      id,
      host: this.get('node.host'),
      type,
    };
    switch (type) {
      case 'bluestore':
        set(config, 'device', device);
        if (dbDevice) {
          set(config, 'dbDevice', dbDevice);
        }
        break;
      case 'filestore':
        if (path) {
          set(config, 'path', path);
        }
        break;
    }
    return config;
  },
});
