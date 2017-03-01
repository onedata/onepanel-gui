import Ember from 'ember';

const {
  computed,
  A
} = Ember;

export default Ember.Component.extend({
  // TODO sync with API
  noStorages: computed.equal('storages.length', 0),
  
  storages: A(),
  
  addStorageOpened: false,
    
  actions: {
    next() {
      this.sendAction('nextStep');
    },
    startAddStorage() {
      this.set('addStorageOpened', true);
    },
    submitAddStorage(storage) {
      // FIXME debug code
      console.debug(JSON.stringify(storage));
      storage.name = storage.storageName;
      this.get('storages').pushObject(storage);
      this.set('addStorageOpened', false);
    }
  }
});
