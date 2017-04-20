import Ember from 'ember';

const {
  computed
} = Ember;


export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['one-step'],
  classNameBindings: ['isActive:active', 'isDone:done', 'stepNumberClassName'],

  index: null,
  title: null,

  stepNumberClassName: computed('index', function() {
    return 'one-step-' + (this.get('index') + 1);
  }),

  displayedIndex: computed('index', function() {
    return this.get('index') + 1;
  })
});
