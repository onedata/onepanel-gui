import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-list-wrapper'],

  items: null,

  isCollectionEmpty: computed.empty('items')
});
