import Service from '@ember/service';

export default Service.extend({
  serviceType: 'oneprovider',
  init() {
    this._super(...arguments);
  },
});
