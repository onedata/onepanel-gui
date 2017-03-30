import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-wizard'],
  classNameBindings: ['stepsNumClassName'],
  currentIndex: 0,

  steps: null,
  stepsNumClassName: computed('steps', function() {
    let steps = this.get('steps'),
      className = "steps-";
    className += steps !== null ? steps.length : 0;
    return className;
  }),

  init() {
    this._super(...arguments);
  },

  currentStep: computed('steps.[]', 'currentIndex', function() {
    let {
      steps,
      currentIndex
    } = this.getProperties('steps', 'currentIndex');

    return steps.objectAt(currentIndex);
  }),

  actions: {
    next() {
      this.incrementProperty('currentIndex');
    }
  }
});
