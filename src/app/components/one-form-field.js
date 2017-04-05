import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

const {
  computed,
  String: { htmlSafe },
} = Ember;

export default Ember.Component.extend({
  tagName: '',

  field: null,
  inputClass: computed('field.name', function () {
    return htmlSafe(`one-form-field-${this.get('field.name')}`);
  }),

  actions: {
    inputChanged() {
      invokeAction(this, 'inputChanged', ...arguments);
    }
  }
});
