import Ember from 'ember';

const {
  inject: {
    service
  },
  computed: {
    readOnly
  }
} = Ember;

// TODO: fake session, do it better with ember session

export default Ember.Component.extend({
  classNames: ['login-box'],

  notify: service(),
  onepanelServer: service(),

  authLoadingPromise: readOnly('onepanelServer.sessionValidator.promise'),

  isLoading: readOnly('authLoadingPromise.isPending'),
  isBusy: false,

  init() {
    this._super(...arguments);
    let authLoading = this.get('authLoadingPromise');
    authLoading.then(() => this.send('authenticationSuccess'));
    authLoading.catch(() => this.send('authenticationFailure'));
  },

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('notify').success('Authentication succeeded!');
      this.sendAction('authenticationSuccess');
      this.set('isBusy', false);
    },

    authenticationFailure() {
      this.get('notify').warning('Authentication failed!');
      this.set('isBusy', false);
    }
  }
});
