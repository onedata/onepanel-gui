import Ember from 'ember';

function getDefaultResource(collection) {
  return collection.objectAt(0);
}

export default Ember.Route.extend({
  model() {
    return this.modelFor('onedata.resources');
  },

  redirect({ collection }) {
    this.transitionTo(
      'onedata.resources.content',
      getDefaultResource(collection)
    );
  }
});
