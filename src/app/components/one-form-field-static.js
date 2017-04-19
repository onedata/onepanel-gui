import Ember from 'ember';

const {
  Component,
  computed,
} = Ember;

export default Component.extend({
  tagName: '',

  fieldNameClass: computed('field.name', function () {
    return `field-${this.get('field.name')}`;
  }),

  field: null,

  fakePassword: false,
});
