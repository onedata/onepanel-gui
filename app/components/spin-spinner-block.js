import Ember from 'ember';

const PREDEF_SIZES = {
  xs: 0.2,
  sm: 0.4,
  md: 0.8,
  lg: 1.2
};

const {
  computed
} = Ember;

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['spin-spinner-block', 'spinner-container'],
  classNameBindings: ['sizeClass'],

  sizeClass: 'lg',

  spinnerScale: computed('sizeClass', function () {
    return PREDEF_SIZES[this.get('sizeClass')];
  })
});
