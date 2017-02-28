import Ember from 'ember';

function getDefaultResourceId(collection) {
  // TODO get id
  return collection.objectAt(0).id;
}

export default Ember.Route.extend({
  model() {
    return this.modelFor('onedata.sidebar');
  },

  redirect({ resourceType, collection }) {
    let resourceIdToRedirect =
      collection.length > 0 ? getDefaultResourceId(collection) : 'empty';
    this.transitionTo(`onedata.sidebar.content`, resourceType, resourceIdToRedirect);
  }
});
