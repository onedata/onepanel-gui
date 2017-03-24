import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    authenticationSuccess() {
      this.transitionTo('onedata');
    }
  }
});
