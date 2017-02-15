import Ember from 'ember';

const {
  observer
} = Ember;

export default Ember.Component.extend({
  model: null,

  init() {
    this._super(...arguments);
    console.log(this.get('model'));
  },

  fixme: observer('model', function() {
    console.log(this.get('model'));
  })
});
