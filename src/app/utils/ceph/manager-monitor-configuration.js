import EmberObject, { set, get } from '@ember/object';

export default EmberObject.extend({
  /**
   * @type {Utils/Ceph/CephNodeConfiguration}
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

  fillIn(newConfig, isValid) {
    const propsToChange = {};
    const newMonitorIp = get(newConfig, 'monitorIp');
    if (this.get('monitorIp') !== newMonitorIp) {
      set(propsToChange, 'monitorIp', newMonitorIp);
    }
    if (isValid !== undefined && this.get('isValid') !== isValid) {
      set(propsToChange, 'isValid', isValid);
    }
    if (get(Object.keys(propsToChange), 'length') > 0) {
      this.setProperties(propsToChange);
    }
  },

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
