import Ember from 'ember';

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
  onezoneDomain: null,
  redirectionPoint: null,
  providerName: null,
  latitude: null,
  longitude: null,
  
  actions: {
    inputChanged(inputType, value) {
      if (isKnownInputType(inputType)) {
        this.set(inputType, value);
      } else {
        console.warn('component:new-cluster-zone-registration: attempt to change not known input type');
      }
    },
    
    submit() {
      // TODO validate
      // TODO use api to submit
      let formValues = this.getProperties('selectedStorageType', ...INPUT_TYPES);
      // FIXME debug
      console.debug('submit: ' + JSON.stringify(formValues));
      this.sendAction('nextStep');
    }
  }
});
