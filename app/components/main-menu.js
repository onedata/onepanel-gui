import Ember from 'ember';

const {
  computed: {
    alias
  }
} = Ember;

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['main-menu'],

  appModel: null,

  items: alias('appModel.mainMenuItems')
});
