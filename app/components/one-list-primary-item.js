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
  isActive: computed('primaryItemId', 'itemId', function() {
    // TODO fix string/int id mess
    return this.get('primaryItemId') == this.get('itemId');
  }),

  actions: {
    changePrimaryItemId(itemId) {
      this.sendAction('changePrimaryItemId', itemId);
    }
  }
});
