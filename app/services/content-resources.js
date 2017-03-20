import Ember from 'ember';

const {
  RSVP: {
    Promise
  },
  inject: {
    service
  },
} = Ember;

export default Ember.Service.extend({
  clusterManager: service(),

  /**
   * @param {string} type
   * @returns {Promise}
   */
  getModelFor(type, id) {
    switch (type) {
    case 'clusters':
      return this.get('clusterManager').getClusterDetails(id);

    default:
      return new Promise((resolve, reject) => reject('No such model type: ' + type));
    }
  },
});
