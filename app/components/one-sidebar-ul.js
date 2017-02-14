import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  tagName: 'ul',
  classNames: ['one-sidebar-ul'],

  items: null,

  query: null,

  visibleItems: computed('items.@each.label', 'query', function() {

  }),

  actions: {
    filterList(query) {
      console.log('should filter by ' + query);
      this.set('query', query);
    }
  }
});
