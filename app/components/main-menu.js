import Ember from 'ember';

const {
  computed,
  computed: {
    readOnly
  },
  inject: {
    service
  }
} = Ember;

// singleton
export default Ember.Component.extend({
  mainMenu: service(),
  eventsBus: service(),

  tagName: 'ul',
  classNames: ['main-menu', 'one-list'],
  classNameBindings: ['sidenavOpened:sidenav-opened'],

  appModel: null,

  currentItemId: null,
  sidenavItemId: null,

  sidenavOpened: computed('sidenavItemId', function () {
    return this.get('sidenavItemId') != null;
  }).readOnly(),

  items: readOnly('appModel.mainMenuItems'),

  actions: {
    itemClicked({
      id
    }) {
      this.sendAction('itemClicked', id);
    }
  }
});
