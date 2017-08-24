import Ember from 'ember';

const {
  Service,
  ObjectProxy,
  PromiseProxyMixin,
  RSVP: { Promise },
  computed,
} = Ember;

const ObjectPromiseProxy = ObjectProxy.extend(PromiseProxyMixin);

// TODO this service stub is probably faulty, because there were problems
// using it in manage-cluster-storages-test

const PROVIDER_ID = 'dfhiufhqw783t462rniw39r-hq27d8gnf8';

export default Service.extend({
  __providerDetails: {
    id: PROVIDER_ID,
    name: 'Some provider 1',
    urls: ['172.17.0.4'],
    redirectionPoint: 'https://172.17.0.4',
    geoLatitude: 49.698284,
    geoLongitude: 21.898093,
  },

  providerCache: computed(function () {
    return ObjectProxy.create({ content: this.get('__providerDetails') })
  }),

  getProviderDetails() {
    return ObjectPromiseProxy.create({
      promise: new Promise(resolve => {
        resolve(this.get('__providerDetails'));
      }),
    });
  },
});
