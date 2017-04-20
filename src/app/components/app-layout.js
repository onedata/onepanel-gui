import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  inject: {
    service
  },
  computed,
  RSVP: {
    Promise
  },
  String: {
    htmlSafe
  }
} = Ember;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

/**
 * Makes layout for whole application in authorized mode.
 *
 * Renders a main menu, mobile menu and sidebar and content grid. Yields
 * "sidebar" or "content" strings for placing a content for these particular
 * parts of view.
 *
 * Invokes actions passed as parameters:
 * - changeTab(itemId: string) - when a content route should be changed
 *
 * @module components/app-layout
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Ember.Component.extend({
  classNames: ['app-layout'],

  mainMenu: service(),
  sidebarResources: service(),
  eventsBus: service(),
  sideMenu: service(),

  // TODO: too much relations: we got mainMenuItemChanged event
  currentTabId: computed.oneWay('mainMenu.currentItemId'),
  sidenavTabId: null,
  showMobileSidebar: false,

  sidenavContentComponent: computed('sidenavTabId', function () {
    let sidenavTabId = this.get('sidenavTabId');
    return `sidebar-${sidenavTabId}`;
  }),

  sidenavModel: computed('sidenavTabId', function () {
    let {
      sidenavTabId,
      sidebarResources
    } = this.getProperties('sidenavTabId', 'sidebarResources');

    let resourceType = sidenavTabId;

    let gettingModel = sidebarResources.getCollectionFor(resourceType);
    let promise = new Promise((resolve, reject) => {
      gettingModel.then(collection => {
        resolve({
          resourceType,
          collection
        });
      });
      gettingModel.catch(reject);
    });

    return ObjectPromiseProxy.create({ promise });
  }),

  colSidebarClass: computed('showMobileSidebar', function () {
    let showMobileSidebar = this.get('showMobileSidebar');
    let base =
      'col-sidebar full-height disable-user-select';
    let xsClass = (showMobileSidebar ? 'col-xs-12' : 'hidden-xs');
    return htmlSafe(`${base} ${xsClass}`);
  }),

  colContentClass: computed('showMobileSidebar', function () {
    let showMobileSidebar = this.get('showMobileSidebar');
    let base =
      'col-in-app-layout col-content col-xs-12 full-height';
    let xsClass = (showMobileSidebar ? 'hidden-xs' : 'col-xs-12');
    return htmlSafe(`${base} ${xsClass}`);
  }),

  init() {
    this._super(...arguments);
    this.get('eventsBus').on('one-sidenav:open', (selector) => {
      if (selector === '#sidenav-sidebar') {
        this.set('sidenavSidebarOpen', true);
      }
    });
    this.get('eventsBus').on('one-sidenav:close', (selector) => {
      if (selector === '#sidenav-sidebar') {
        this.set('sidenavSidebarOpen', false);
        this.set('sidenavTabId', null);
      }
    });
  },

  actions: {
    // TODO IMPORTANT: who is receiver of eventsBus' one-sidenav:open/close?
    closeSidenav() {
      this.get('eventsBus').trigger('one-sidenav:close', '#sidenav-sidebar');
    },
    sidenavClosed() {
      this.set('sidenavItemId', null);
    },
    // TODO IMPORTANT: inconsistent depedencies between component:main-menu, service:main-menu and component:app-layout
    mainMenuItemClicked(itemId) {
      let {
        sidenavTabId,
        currentTabId
      } = this.getProperties('sidenavTabId', 'currentTabId');
      let shouldOpen = (
        (!sidenavTabId && currentTabId !== itemId) ||
        (!!sidenavTabId && sidenavTabId !== itemId)
      );
      let action = (shouldOpen ? 'open' : 'close');
      this.get('eventsBus').trigger('one-sidenav:' + action, '#sidenav-sidebar');
      if (shouldOpen) {
        this.set('sidenavTabId', itemId);
      }
    },
    mobileMenuItemChanged(itemId) {
      let sideMenu = this.get('sideMenu');
      sideMenu.close();
      this.set('sidenavTabId', null);
      invokeAction(this, 'changeTab', itemId);
    },
    showMobileSidebar() {
      this.set('showMobileSidebar', true);
    },
    manageAccount() {
      invokeAction(this, 'manageAccount');
    },
  }
});
