import Ember from 'ember';

const INPUT_TYPES = [
  'storageName',
  'username',
  'password',
  'bucketName',
  'blockSize',
  'timeout',
  'insecure'
];

function isKnownInputType(type) {
  return INPUT_TYPES.indexOf(type) !== -1;
}

export default Ember.Component.extend({    
  storageTypes: ['S3', 'POSIX'],
  
  storageType: 'S3',
  storageName: '',
  username: '',
  password: '',
  bucketName: '',
  blockSize: '',
  timeout: '',
  insecure: false,

  actions: {
    storageTypeChanged(type) {
      this.set('selectedStorageType', type);
    },
    
    inputChanged(inputType, value) {
      if (isKnownInputType(inputType)) {
        this.set(inputType, value);
      } else {
        console.warn('component:cluster-storage-add-form: attempt to change not known input type');
      }
    },
    
    submit() {
      let formValues = this.getProperties('storageType', ...INPUT_TYPES);
      // FIXME debug
      console.debug('submit: ' + JSON.stringify(formValues));
      this.sendAction('submit', formValues);
      return false;
    }
  }
});
