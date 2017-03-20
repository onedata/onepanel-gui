import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

export default Ember.Component.extend({
  initStepIndex: 0,

  // TODO: i18n
  steps: [{
    id: 0,
    title: 'cluster installation'
  }, {
    id: 1,
    title: 'zone registration'
  }, {
    id: 2,
    title: 'storage configuration'
  }, {
    id: 3,
    title: 'summary'
  }],

  actions: {
    clusterConfigurationSuccess() {
      // TODO currently nothing more to do
    },
    transitionTo() {
      return invokeAction(this, 'transitionTo', ...arguments);
    }
  }
});
