import Ember from 'ember';

const {
  inject: {
    service
  },
  RSVP: {
    Promise
  }
} = Ember;

export default Ember.Component.extend({
  classNames: ['basicauth-login-form'],

  onepanelServer: service(),

  username: '',
  password: '',

  isDisabled: false,

  onLoginStarted() {
    this.set('isDisabled', true);
  },

  onLoginSuccess(username, password) {
    let onepanelServer = this.get('onepanelServer');
    console.debug(
      `component:basicauth-login-form: Credentials provided for ${username} are valid`
    );
    onepanelServer.initClient(username, password);
    this.sendAction('authenticationSuccess', {
      username,
      password
    });
    this.set('isDisabled', false);
  },

  onLoginFailure(username, password) {
    console.debug(
      `component:basicauth-login-form: Credentials provided for ${username} are invalid`
    );
    this.sendAction('authenticationFailure', {
      username,
      password
    });
    this.set('isDisabled', false);
  },

  actions: {
    submitLogin(username, password) {
      let onepanelServer = this.get('onepanelServer');
      this.onLoginStarted();
      this.sendAction('authenticationStarted');

      let loginCalling = onepanelServer.login(username, password);

      loginCalling.then(( /*data, textStatus, jqXHR*/ ) => {
        let onepanelServer = this.get('onepanelServer');
        onepanelServer.initClient();
        let authTestRequest = onepanelServer.request('onepanel',
          'getClusterCookie');
        authTestRequest.then(() => this.onLoginSuccess(username,
          password));
        authTestRequest.catch(() => this.onLoginFailure(username,
          password));
      });

      loginCalling.catch(( /*jqXHR, textStatus, errorThrown*/ ) => {
        this.onLoginFailure();
      });

      return loginCalling;
    }
  }
});
