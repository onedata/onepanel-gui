import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',
  classNames: ['search-bar'],
  attributeBindings: ['placeholder'],

  placeholder: 'Search...',

  input() {
    this.sendAction('search', this.element.value);
  }
});
