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

  menuOpen: false,

  username: alias('onepanelServer.username'),

  menuTriggerSelector: computed(function () {
    return `#${this.get('elementId')} .user-toggle-icon`;
  }),

  actions: {
    toggleMenu() {
      this.toggleProperty('menuOpen');
    },
    manageAccount() {
      return invokeAction(this, 'manageAccount');
    },
    logout() {
      return invokeAction(this, 'logout');
    },
  },
});
