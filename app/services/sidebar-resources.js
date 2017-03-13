import Ember from 'ember';

const {
  RSVP: {
    Promise
  },
  inject: {
    service
  },
  A
} = Ember;

const TMP_SPACES = [{
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

const TMP_GROUPS = [];

export default Ember.Service.extend({
  clusterManager: service(),

  // TODO: should use User relations
  getModelFor(type) {
    switch (type) {
      case 'spaces':
        return new Promise(resolve => resolve(TMP_SPACES));

      case 'groups':
        return new Promise(resolve => resolve(TMP_GROUPS));

      case 'shares':
        return new Promise(resolve => resolve([]));

      case 'clusters':
        let clusterManager = this.get('clusterManager');
        return new Promise(resolve => resolve(clusterManager.get('clusters')));

      default:
        return new Promise((resolve, reject) => reject('No such model: ' + type));
    }
  }
});
