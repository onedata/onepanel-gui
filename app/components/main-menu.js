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

  tagName: 'ul',
  classNames: ['main-menu'],

  appModel: null,

  currentItemId: readOnly('mainMenu.currentItemId'),

  items: readOnly('appModel.mainMenuItems'),

  actions: {
    itemClicked(item) {
      let mainMenu = this.get('mainMenu');
      mainMenu.currentItemChanged(item);
      this.sendAction('mainMenuItemChanged', item.id);
    }
  }
});
