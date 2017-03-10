import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  classNames: ['search-bar'],
  attributeBindings: ['placeholder', 'type'],

  type: 'search',

  // TODO translate
  placeholder: 'Search...',

  input() {
    this.sendAction('search', this.element.value);
  }
});
