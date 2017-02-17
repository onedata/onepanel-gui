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
  sidebar: service(),

  model: null,

  resourceType: readOnly('model.resourceType'),

  primaryItemId: computed('sidebar.items.[]', function() {
    return this.get('sidebar.items').objectAt(0);
  }),

  secondaryItemId: computed('sidebar.items.[]', function() {
    return this.get('sidebar.items').objectAt(1);
  }),

  actions: {
    changePrimaryItemId(itemId) {
      // TODO getproperties
      let sidebar = this.get('sidebar');
      let resourceType = this.get('resourceType');
      sidebar.set('items', [itemId]);
      this.sendAction('changeResourceId', resourceType, itemId);
    }
  }
});
