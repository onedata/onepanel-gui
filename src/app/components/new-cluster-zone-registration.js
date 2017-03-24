import Ember from 'ember';
import Onepanel from 'npm:onepanel';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

const {
  ProviderRegisterRequest
} = Onepanel;

const INPUT_TYPES = [
  'onezoneDomain',
  'redirectionPoint',
  'providerName',
  'latitude',
  'longitude'
];

function isKnownInputType(type) {
  return INPUT_TYPES.indexOf(type) !== -1;
}

export default Ember.Component.extend({
  onepanelServer: service(),

  onezoneDomain: null,
  redirectionPoint: null,
  providerName: null,
  latitude: null,
  longitude: null,

  createProviderRegisterRequest() {
    let formValues = this.getProperties(...INPUT_TYPES);

    let req = ProviderRegisterRequest.constructFromObject({
      name: formValues.providerName,
      redirectionPoint: formValues.redirectionPoint,
      geoLongitude: Number.parseFloat(formValues.longitude).toFixed(20),
      geoLatitude: Number.parseFloat(formValues.latitude).toFixed(20),
      onezoneDomainName: formValues.onezoneDomain
    });

    return req;
  },

  submit() {
    let submitting = new Promise((resolve, reject) => {
      let onepanelServer = this.get('onepanelServer');
      // TODO validate
      // TODO use api to submit
      let formValues = this.getProperties('selectedStorageType', ...INPUT_TYPES);
      // FIXME debug
      console.debug('submit: ' + JSON.stringify(formValues));
      let providerRegisterRequest = this.createProviderRegisterRequest();
      let addingProvider =
        onepanelServer.request('oneprovider', 'addProvider', providerRegisterRequest);

      addingProvider.then(resolve);
      addingProvider.catch(reject);
    });

    return submitting;
  },

  actions: {
    inputChanged(inputType, value) {
      if (isKnownInputType(inputType)) {
        this.set(inputType, value);
      } else {
        console.warn('component:new-cluster-zone-registration: attempt to change not known input type');
      }
    },

    submit() {
      let submitting = this.submit();
      submitting.then(() => {
        this.sendAction('nextStep');
      });
      return submitting;
    }
  }
});
