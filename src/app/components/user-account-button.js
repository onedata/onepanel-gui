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

  onepanelServer: service(),
  globalNotify: service(),

  menuOpen: false,

  username: alias('onepanelServer.username'),

  menuTriggerSelector: computed(function () {
    return `#${this.get('elementId')} .user-toggle-icon`;
  }),

  menuItemClasses: computed('isActive', function () {
    let isActive = this.get('isActive'),
      classes =
      'user-account-button-main one-list-item item-header clickable';
    if (isActive) {
      classes += ' active';
    }
    return classes;
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