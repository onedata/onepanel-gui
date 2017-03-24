import Ember from 'ember';

const {
  inject: {
    service
  },
  computed: {
    readOnly
  },
  computed
} = Ember;

export default Ember.Component.extend({
  classNames: ['two-level-sidebar'],

  sidebar: service(),

  model: null,

  resourceType: readOnly('model.resourceType'),

  isCollectionEmpty: computed.equal('model.collection.length', 0),

  primaryItemId: computed('sidebar.itemPath.[]', function () {
    return this.get('sidebar.itemPath').objectAt(0);
  }),

  secondaryItemId: computed('sidebar.itemPath.[]', function () {
    return this.get('sidebar.itemPath').objectAt(1);
  }),

  actions: {
    changePrimaryItemId(itemId) {
      let resourceType = this.get('resourceType');

      this.sendAction('changeResourceId', resourceType, itemId);
    }
  }
});
