import Ember from 'ember';

const {
  computed,
  String: {
    capitalize
  }
} = Ember;

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['main-menu-item', 'one-list-item', 'clickable'],
  classNameBindings: ['isActive:active', 'isSelected:selected'],

  item: null,
  isActive: false,
  isSelected: false,

  name: computed('item.id', function() {
    let item = this.get('item');
    return capitalize(item.id);
  }),

  click() {
    let item = this.get('item');
    this.sendAction('itemClicked', item);
    return false;
  }
});
