import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    transitionTo() {
      this.transitionTo(...arguments);
    }
  },
});
