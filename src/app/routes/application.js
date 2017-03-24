import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionTo() {
      let transition = this.transitionTo(...arguments);
      return transition.promise;
    }
  },
});
