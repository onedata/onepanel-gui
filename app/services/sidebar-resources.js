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
  getCollectionFor(type) {
    switch (type) {
    case 'clusters':
      return this.get('clusterManager.clustersProxy.promise');

    default:
      return new Promise((resolve, reject) => reject('No such collection: ' + type));
    }
  }
});
