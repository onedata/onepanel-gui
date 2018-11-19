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
   * @type {string}
   * @virtual
   */
  type: 'bluestore',

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
   * If true then manager & monitor config is valid
   * @type {boolean}
   */
  isValid: true,

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
