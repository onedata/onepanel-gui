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
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

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
  },

  // TODO only for cluster-specific - make more generic

  cluster: readOnly('model.collection.firstObject'),

  secondLevelItems: computed('onepanelServiceType', 'cluster.isInitialized', function () {
    let {
      onepanelServiceType,
      cluster,
    } = this.getProperties('onepanelServiceType', 'cluster');
    if (onepanelServiceType === 'provider' && cluster.get('isInitialized')) {
      return [{
        id: 'spaces',
        label: 'Spaces',
      }];
    } else {
      return [];
    }
  }).readOnly(),
});
