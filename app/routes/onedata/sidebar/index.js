import Ember from 'ember';

function getDefaultResourceId(collection) {
  // TODO get id
  let defaultResource = collection.objectAt(0);
  return defaultResource.id != null ? defaultResource.id : defaultResource.get('id');
}

export default Ember.Route.extend({
  model() {
    return this.modelFor('onedata.sidebar');
  },

  redirect({ resourceType, collection }, transition) {
    let resourceIdToRedirect =
      collection.length > 0 ? getDefaultResourceId(collection) : 'empty';
    if (resourceIdToRedirect != null) {
      this.transitionTo(`onedata.sidebar.content`, resourceType, resourceIdToRedirect);
    } else {
      // TODO notify about error
      console.error(
        'collection is not empty, but cannot get default resource id - this is an error unhandled error'
      );
      transition.abort();
    }
  }
});
