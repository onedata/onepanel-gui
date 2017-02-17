import Ember from 'ember';

const {
  computed,
  computed: {
    readOnly
  },
  inject: {
    service
  }
} = Ember;

export default Ember.Component.extend({
  classNames: ['one-sidebar'],

  sidebar: service(),

  resourcesModel: null,

  currentItemId: readOnly('sidebar.currentItemId'),

  buttons: readOnly('resourcesModel.buttons'),

  title: computed('resourcesModel.resourceType', function() {
    let resourcesType = this.get('resourcesModel.resourceType');
    return resourcesType;
  }),
});
