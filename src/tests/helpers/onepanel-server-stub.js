import Service from '@ember/service';

export default Service.extend({
  /**
   * @virtual
   * @type {Promise}
   */
  userPromise: undefined,

  serviceType: 'oneprovider',
  init() {
    this._super(...arguments);
  },

  getCurrentUser() {
    return this.get('userPromise');
  },
});
