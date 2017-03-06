import Ember from 'ember';

const {
  inject: {
    service
  }
} = Ember;

// TODO: fake session, do it better with ember session

export default Ember.Component.extend({
  notify: service(),
  onepanelServer: service(),

  init() {
    this._super(...arguments);
    let onepanelServer = this.get('onepanelServer');

    this.send('authenticationStarted');
    let authLoading = onepanelServer.get('sessionValidator.promise');
    authLoading.then(() => this.send('authenticationSuccess'));
    authLoading.catch(() => this.send('authenticationFailure'));
  },

  actions: {
    authenticationStarted() {
      this.set('isLoading', true);
    },

    authenticationSuccess() {
      this.get('notify').success('Authentication succeeded!');
      this.sendAction('authenticationSuccess');
      this.set('isLoading', false);
    },

    authenticationFailure() {
      this.get('notify').warning('Authentication failed!');
      this.set('isLoading', false);
    }
  }
});
