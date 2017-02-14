import Ember from 'ember';

const {
  computed,
  computed: {
    readOnly
  }
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-sidebar'],

  resourcesModel: null,

  buttons: readOnly('resourcesModel.buttons'),

  title: computed('resourcesModel.resourceType', function() {
    let resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType;
  }),
});
