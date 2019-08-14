/**
 * Class that represents global ceph cluster parameters.
 * 
 * @module utils/ceph/cluster-main-configuration
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';

export default EmberObject.extend({
  /**
   * @type {string}
   */
  name: 'ceph',

  /**
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
    const name = this.get('name');
    const newName = get(newConfig, 'name');
    if (newConfig && name !== newName) {
      this.set('name', newName);
    }
    if (isValid !== undefined && this.get('isValid') !== isValid) {
      this.set('isValid', isValid);
    }
  },

  /**
   * Creates raw object with configuration data. It is compatible with format
   * used by backend.
   * @returns {Object}
   */
  toRawConfig() {
    const name = this.get('name');
    const config = {
      name,
    };
    return config;
  },
});
