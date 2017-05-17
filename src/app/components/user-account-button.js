/**
 * A button that allows to invoke various actions for current user account 
 *
 * @module components/user-account-button
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';
import ClickOutside from 'ember-click-outside/mixins/click-outside';

const {
  Component,
  inject: { service },
  computed,
  computed: { alias },
  on,
  run: { next },
} = Ember;

export default Component.extend(ClickOutside, {
  classNames: ['user-account-button'],
  classNameBindings: ['mobileMode:user-account-button-mobile'],

  onepanelServer: service(),
  globalNotify: service(),

  menuOpen: false,

  mobileMode: false,

  username: alias('onepanelServer.username'),

  menuTriggerSelector: computed(function () {
    return `#${this.get('elementId')} .user-toggle-icon`;
  }),

  menuItemClasses: computed('mobileMode', function () {
    if (this.get('mobileMode')) {
      return 'one-list-item main-menu-item clickable';
    }
    else {
      return 'one-list-item enabled clickable main-menu-item user-account-button-main';
    }
  }),

  _attachClickOutsideHandler: on('didInsertElement', function () {
    next(this, this.addClickOutsideListener);
  }),

  _removeClickOutsideHandler: on('willDestroyElement', function () {
    this.removeClickOutsideListener();
  }),

  clickOutside() {
    this.set('menuOpen', false);
  },

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
