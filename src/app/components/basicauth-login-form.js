import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  inject: {
    service
  }
} = Ember;

export default Ember.Component.extend({
  classNames: ['basicauth-login-form'],

  onepanelServer: service(),
  globalNotify: service(),

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
    let initializing = onepanelServer.initClient();
    initializing.then(() => {
      invokeAction(this, 'authenticationSuccess', {
        username,
        password
      });
      this.set('isDisabled', false);
    });
    initializing.catch(this.onInitClientError.bind(this));
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

  onInitClientError(error) {
    // TODO better message, i18n
    this.get('globalNotify')
      .error('Failed to initialize HTTP client: ' + error || 'unknown error');
  },

  actions: {
    submitLogin(username, password) {
      let onepanelServer = this.get('onepanelServer');
      this.onLoginStarted();
      this.sendAction('authenticationStarted');

      let loginCalling = onepanelServer.login(username, password);

      loginCalling.then(( /*data, textStatus, jqXHR*/ ) => {
        let initializing = onepanelServer.initClient();
        initializing.then(() => {
          let authTestRequest = onepanelServer.request('onepanel',
            'getClusterCookie');
          authTestRequest.then(() => this.onLoginSuccess(username, password));
          authTestRequest.catch(() => this.onLoginFailure(username, password));
        });
        initializing.catch(this.onInitClientError.bind(this));
      });

      loginCalling.catch(( /*jqXHR, textStatus, errorThrown*/ ) => {
        this.onLoginFailure();
      });

      return loginCalling;
    }
  }
});
