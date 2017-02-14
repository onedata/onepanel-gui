import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'input',

  input() {
    this.sendAction('search', this.element.value);
  }
});
