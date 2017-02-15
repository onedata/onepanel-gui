import Ember from 'ember';

const {
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
  classNames: ['main-menu'],

  appModel: null,

  currentItemId: readOnly('mainMenu.currentItemId'),

  items: readOnly('appModel.mainMenuItems'),

  actions: {
    itemClicked({ id }) {
      // TODO when to change currentItem?
      // let mainMenu = this.get('mainMenu');
      // mainMenu.currentItemIdChanged(item);
      this.sendAction('currentItemChanged', id);

      // FIXME: load proper view to sidenav

      // this.sendAction('mainMenuItemChanged', item.id);
    }
  }
});
