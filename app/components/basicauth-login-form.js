import Ember from 'ember';

const {
  inject: {
    service
  }
} = Ember;

export default Ember.Component.extend({
  onepanelServer: service(),

  onLoginSuccess(username, password) {
    let onepanelServer = this.get('onepanelServer');
    console.debug(`component:basicauth-login-form: Credentials provided for ${username} are valid`);
    onepanelServer.initializeClient(username, password);
    this.sendAction('authenticationSuccess', { username, password });
  },

  onLoginFailure(username, password) {
    console.debug(`component:basicauth-login-form: Credentials provided for ${username} are invalid`);
    this.set('lastFailed', true);
    this.sendAction('authenticationFailure', { username, password });
  },

  actions: {
    submitLogin(username, password) {
      let onepanelServer = this.get('onepanelServer');
      let authTestRequest = onepanelServer.requestTestAuth(username, password);
      authTestRequest.then(() => this.onLoginSuccess(username, password));
      authTestRequest.catch(() => this.onLoginFailure(username, password));
    }
  }
});
