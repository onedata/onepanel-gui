import Ember from 'ember';

const {
  computed: {
    alias
  }
} = Ember;

export default Ember.Component.extend({
  classNames: ['main-content'],

  resource: null,

  title: alias('resource.resourceId')
});
