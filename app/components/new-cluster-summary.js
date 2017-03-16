import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

export default Ember.Component.extend({
  clusterId: null,

  actions: {
    manageNewCluster() {
      return invokeAction(this,
        'transitionTo',
        'onedata.sidebar.content',
        'clusters',
        this.get('clusterId')
      );
    }
  }
});
