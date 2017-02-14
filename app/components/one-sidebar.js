import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-sidebar'],

  title: computed('resourcesModel.resourceType', function() {
    let resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType;
  }),
});
