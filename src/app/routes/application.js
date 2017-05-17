import Ember from 'ember';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    transitionTo() {
      let transition = this.transitionTo(...arguments);
      return transition.promise;
    }
  },
});
