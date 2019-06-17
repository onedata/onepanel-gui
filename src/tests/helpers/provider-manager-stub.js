import Service from '@ember/service';
import { Promise } from 'rsvp';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

// TODO this service stub is probably faulty, because there were problems
// using it in manage-cluster-storages-test

const PROVIDER_ID = 'dfhiufhqw783t462rniw39r-hq27d8gnf8';

export default Service.extend({
  __providerDetails: undefined,

  providerCache: computed('__providerDetails', function () {
    return ObjectProxy.create({ content: this.get('__providerDetails') });
  }),

  init() {
    this._super(...arguments);
    this.set('__providerDetails', {
      id: PROVIDER_ID,
      name: 'Some provider 1',
      subdomainDelegation: true,
      subdomain: 'subdomain',
      geoLatitude: 49.698284,
      geoLongitude: 21.898093,
      onezoneDomainName: 'zonedomain.com',
    });
  },

  getProviderDetailsProxy() {
    return PromiseObject.create({
      promise: new Promise(resolve => {
        resolve(this.get('__providerDetails'));
      }),
    });
  },
});
