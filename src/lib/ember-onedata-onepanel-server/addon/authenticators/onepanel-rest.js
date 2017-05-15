import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';

const {
  inject: { service },
} = Ember;

export default BaseAuthenticator.extend({
  onepanelServer: service('onepanelServer'),

  restore() {
    return this.get('onepanelServer').validateSession();
  },

  authenticate(username, password) {
    return this.get('onepanelServer').login(username, password);
  },

  invalidate() {
    return this.get('onepanelServer').request('onepanel', 'removeSession');
  }
});
