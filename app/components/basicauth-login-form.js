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
    console.debug(`component:basicauth-login-form: Credentials provided for ${username} are valid`);
    onepanelServer.initClient(username, password);
    this.sendAction('authenticationSuccess', {
      username,
      password
    });
    this.set('isDisabled', false);
  },

  onLoginFailure(username, password) {
    console.debug(`component:basicauth-login-form: Credentials provided for ${username} are invalid`);
    this.sendAction('authenticationFailure', {
      username,
      password
    });
    this.set('isDisabled', false);
  },

  actions: {
    submitLogin(username, password) {
      this.onLoginStarted();
      this.sendAction('authenticationStarted');

      let loginCalling = new Promise((resolve, reject) => {
        let success = function (data, textStatus, jqXHR) {
          resolve({
            data,
            textStatus,
            jqXHR
          });
        };

        let error = function (jqXHR, textStatus, errorThrown) {
          reject({
            jqXHR,
            textStatus,
            errorThrown
          });
        };

        // TODO: testing debug timeout      
        setTimeout(() => {
          $.ajax('/api/v3/onepanel/login', {
            method: 'POST',
            contentType: 'application/json',
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
            },
            success,
            error
          });
        }, 2000);

      });

      loginCalling.then(( /*data, textStatus, jqXHR*/ ) => {
        let onepanelServer = this.get('onepanelServer');
        onepanelServer.initClient();
        let authTestRequest = onepanelServer.request('onepanel', 'getClusterCookie');
        authTestRequest.then(() => this.onLoginSuccess(username, password));
        authTestRequest.catch(() => this.onLoginFailure(username, password));
      });

      loginCalling.catch(( /*jqXHR, textStatus, errorThrown*/ ) => {
        this.onLoginFailure();
      });

      return loginCalling;
    }
  }
});
