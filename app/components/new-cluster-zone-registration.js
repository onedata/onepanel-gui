import Ember from 'ember';

const INPUT_TYPES = [
  'storageName',
  'username',
  'password',
  'bucketName',
  'blockSize',
  'timeout'
];

function isKnownInputType(type) {
  return INPUT_TYPES.indexOf(type) !== -1;
}

export default Ember.Component.extend({
  // TODO fetch storage types with API
  storageTypes: ['S3', 'Super Storage', 'Other Storage'],
  
  selectedStorageType: null,
  storageName: null,
  username: null,
  password: null,
  bucketName: null,
  blockSize: null,
  timeout: null,
  
  actions: {
    storageTypeChanged(type) {
      this.set('selectedStorageType', type);
    },
    
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
