import Service from '@ember/service';

export default Service.extend({
  serviceType: 'provider',
  init() {
    this._super(...arguments);
  },
});
