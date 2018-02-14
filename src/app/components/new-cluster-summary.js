import Component from '@ember/component';
import { invokeAction } from 'ember-invoke-action';

export default Component.extend({
  clusterId: null,

  actions: {
    manageNewCluster() {
      return invokeAction(this, 'finish');
    },
  },
});
