/**
 * Class that represents Ceph manager & monitor services parameters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set, get } from '@ember/object';

export default EmberObject.extend({
  /**
   * @type {Utils/Ceph/NodeConfiguration}
   * @virtual
   */
  node: undefined,

  /**
   * Monitor IP
   * @type {string}
   * @virtual
   */
  monitorIp: undefined,

  /**
   * If true, manager & monitor services are enabled
   * @type {boolean}
   */
  isEnabled: false,

  /**
   * If true then manager & monitor config is valid
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
    const newMonitorIp = get(newConfig, 'monitorIp');
    if (this.get('monitorIp') !== newMonitorIp) {
      propsToChange.monitorIp = newMonitorIp;
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
      isEnabled,
      monitorIp,
    } = this.getProperties('isEnabled', 'monitorIp');
    const host = this.get('node.host');

    const config = {
      managers: [],
      monitors: [],
    };

    if (isEnabled) {
      const managerConfig = { host };
      const monitorConfig = { host };
      if (monitorIp) {
        set(monitorConfig, 'ip', monitorIp);
      }
      get(config, 'managers').push(managerConfig);
      get(config, 'monitors').push(monitorConfig);
    }

    return config;
  },
});
