import Ember from 'ember';

export default Ember.Service.extend({
  currentItemChanged({ id }) {
    this.set('currentItemId', id);
  },
});
