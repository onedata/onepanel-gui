import Ember from 'ember';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

const {
  inject: { service },
} = Ember;

export default Ember.Route.extend(ApplicationRouteMixin, {
  onepanelServer: service(),

  beforeModel() {
    return this.get('onepanelServer').fetchAndSetServiceType();
  },

  actions: {
    transitionTo() {
      let transition = this.transitionTo(...arguments);
      return transition.promise;
    }
  },
});
