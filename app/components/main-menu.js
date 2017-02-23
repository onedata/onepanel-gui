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

  appModel: null,

  currentItemId: null,
  sidenavItemId: null,
  
  sidenavOpened: computed('sidenavItemId', function() {
    return this.get(this.get('sidenavItemId')) != null;
  }),

  items: readOnly('appModel.mainMenuItems'),

  actions: {
    itemClicked({ id }) {
      let {
        currentItemId,
        sidenavItemId  
      } = this.getProperties(
         'currentItemId', 'sidenavItemId'
      );
      let shouldChangeCurrentItem = (
        (!sidenavItemId && currentItemId !== id) ||
        (!!sidenavItemId && sidenavItemId !== id)        
      );
      if (shouldChangeCurrentItem) {
        this.set('sidenavItemId', id);
        this.sendAction('currentItemChanged', id);
      }
    }
  }
});
