/**
 * Renders new cluster deployment process (steps bar and their content)
 *
 * Invokes actions:
 * - transitionTo(*any) - passes the action down
 *
 * @module components/new-cluster
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import { invokeAction } from 'ember-invoke-action';

export default Ember.Component.extend({
  initStepIndex: 0,

  _isInProcess: false,

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

  init() {
    this._super(...arguments);
    this.set('_isInProcess', this.get('initStepIndex') > 0);
  },

  actions: {
    clusterConfigurationSuccess() {
      // TODO currently nothing more to do
    },
    finishInitProcess() {
      return invokeAction(this, 'finishInitProcess');
    }
  }
});
