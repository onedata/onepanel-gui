import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';

const {
  inject: { service },
  RSVP: { Promise },
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
    return new Promise((resolve, reject) => {
      let removingSession = this.get('onepanelServer').request('onepanel', 'removeSession');
      removingSession.then(resolve);
      removingSession.catch(error => {
        if (error && error.response && error.response.statusCode === 401) {
          resolve();
        } else {
          reject(error);
        }
      });
    });
    
  }
});
