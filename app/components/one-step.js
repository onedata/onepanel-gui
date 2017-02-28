import Ember from 'ember';

const {
  computed
} = Ember;


export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['one-step'],
  classNameBindings: ['isActive:active'],

  index: null,
  title: null,

  displayedIndex: computed('index', function() {
    return this.get('index') + 1;
  })
});
