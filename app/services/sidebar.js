import Ember from 'ember';

export default Ember.Service.extend({
  items: [],

  // TODO
  fixme: Ember.observer('items.[]', function() {
    console.log(this.get('items.[]'));
  })
});
