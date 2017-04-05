import Ember from 'ember';

const {
  Service,
} = Ember;

export default Service.extend({
  serviceType: 'provider',
  init() {
    this._super(...arguments);
  }
});
