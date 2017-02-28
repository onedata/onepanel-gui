import Ember from 'ember';

const TMP_SPACES = [
  {
    id: '1',
    label: 'Jeden'
  },
  {
    id: '2',
    label: 'Dwa'
  },
  {
    id: '3',
    label: 'Jeden-Cztery'
  },
  {
    id: '4',
    label: 'Cztery'
  },
];

const TMP_GROUPS = [
  {
    id: 'a',
    label: 'Group A'
  },
  {
    id: 'b',
    label: 'Group B'
  },
  {
    id: 'c',
    label: 'Group C'
  },
  {
    id: 'd',
    label: 'Group D'
  },
];

const TMP_CLUSTERS = [
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
    
      case 'groups':
        return new Promise(resolve => resolve(TMP_GROUPS));
    
      case 'clusters':
        return new Promise(resolve => resolve(TMP_CLUSTERS));

      default:
        return new Promise((resolve, reject) => reject('No such model: ' + type));
    }
  }
});
