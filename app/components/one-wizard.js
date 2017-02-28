import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-wizard'],
  currentIndex: 0,

  steps: null,

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
