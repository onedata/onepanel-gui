import Ember from 'ember';

const {
  inject: {
    service
  },
  computed
} = Ember;

const ObjectPromiseProxy = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin);

export default Ember.Component.extend({
  classNames: ['app-layout'],

  mainMenu: service(),
  sidebarResources: service(),
  eventsBus: service(),
  sideMenu: service(),

  // TODO: too much relations: we got mainMenuItemChanged event
  currentTabId: computed.readOnly('mainMenu.currentItemId'),

  sidenavContentComponent: computed('currentTabId', function() {
    let currentTabId = this.get('currentTabId');
    return `sidebar-${currentTabId}`;
  }),

  // TODO: should loading model code be here?
  tabModel: computed('currentTabId', function() {
    let {
      currentTabId,
      sidebarResources
    } = this.getProperties('currentTabId', 'sidebarResources');
    
    return ObjectPromiseProxy.create({
      promise: sidebarResources.getModelFor(currentTabId)
    });
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
      }
    });
  },

  actions: {
    // TODO IMPORTANT: who is receiver of eventsBus' one-sidenav:open/close?
    closeSidenav() {
      this.get('eventsBus').trigger('one-sidenav:close', '#sidenav-sidebar');
    },
    // TODO IMPORTANT: inconsistent depedencies between component:main-menu, service:main-menu and component:app-layout
    mainMenuItemChanged(/*itemId*/) {
      this.get('eventsBus').trigger('one-sidenav:open', '#sidenav-sidebar');
    },
    mobileMenuItemChanged() {
      let sideMenu = this.get('sideMenu');
      sideMenu.close();
    }
  }
});
