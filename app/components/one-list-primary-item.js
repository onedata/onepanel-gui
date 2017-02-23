import Ember from 'ember';

const {
  computed: {
    readOnly
  },
  computed
} = Ember;

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['one-list-item', 'clickable'],
  classNameBindings: ['isActive:active'],

  primaryItemId: null,

  itemId: readOnly('item.id'),
  isActive: false,

  actions: {
    changePrimaryItemId(itemId) {
      this.sendAction('changePrimaryItemId', itemId);
    }
  }
});
