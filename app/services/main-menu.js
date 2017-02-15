import Ember from 'ember';

export default Ember.Service.extend({
  currentItemId: null,
  
  currentItemChanged({ id }) {
    this.set('currentItemId', id);
  },
});
