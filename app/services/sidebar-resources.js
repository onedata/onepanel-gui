import Ember from 'ember';

const TMP_SPACES = [
  {
    id: 1,
    label: 'jeden'
  },
  {
    id: 2,
    label: 'dwa'
  },
  {
    id: 3,
    label: 'jeden-cztery'
  },
  {
    id: 4,
    label: 'cztery'
  },
];

const {
  RSVP: {
    Promise
  }
} = Ember;

export default Ember.Service.extend({
  // TODO: should use User relations
  getModelFor(type) {
    switch (type) {
      case 'spaces':
        return new Promise(resolve => resolve(TMP_SPACES));
    
      default:
        return new Promise((resolve, reject) => reject('No such model: ' + type));
    }
  }
});
