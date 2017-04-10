import Ember from 'ember';

const {
  A,
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

export default Service.extend({
  getStorages() {
    return ObjectPromiseProxy.create({
      promise: new Promise((resolve) => resolve(A([])))
    });
  }
});
