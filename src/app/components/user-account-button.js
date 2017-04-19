import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  Component,
  inject: { service },
  computed,
  computed: { alias },
} = Ember;

export default Component.extend({
  classNames: ['user-account-button'],

  onepanelServer: service(),
  globalNotify: service(),

  menuOpen: false,

  username: alias('onepanelServer.username'),

  menuTriggerSelector: computed(function () {
    return `#${this.get('elementId')} .user-toggle-icon`;
  }),

  actions: {
    toggleMenu() {
      this.toggleProperty('menuOpen');
    },
    // TODO handle error if manage account cannot be displayed
    manageAccount() {
      invokeAction(this, 'manageAccount');
      this.set('menuOpen', false);
    },
    logout() {
      let onepanelServer = this.get('onepanelServer');
      let loggingOut = onepanelServer.request('onepanel', 'removeSession');
      loggingOut.then(() => window.location.reload());
      loggingOut.catch(error => {
        this.get('globalNotify').error(`We are sorry, but logout failed: ${error}`);
      });
      loggingOut.finally(() => this.set('menuOpen', false));
      return loggingOut;
    },
  },
});
