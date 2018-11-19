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

  toRawConfig() {
    const name = this.get('name');
    const config = {
      name,
    };
    return config;
  },
});
