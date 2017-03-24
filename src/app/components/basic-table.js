import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'table',
  classNames: ['basic-table', '-no-resize'],

  didInsertElement() {
    this.$().basictable({
      breakpoint: 768
    });
  }
});
