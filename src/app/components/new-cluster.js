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

const {
  inject: { service },
  computed: { readOnly },
} = Ember;

const STEPS_PROVIDER = [{
  id: 'installation',
  title: 'cluster installation'
}, {
  id: 'provider-registration',
  title: 'zone registration'
}, {
  id: 'provider-storage',
  title: 'storage configuration'
}, {
  id: 'summary',
  title: 'summary'
}];

const STEPS_ZONE = [{
  id: 'installation',
  title: 'cluster installation'
}, {
  id: 'summary',
  title: 'summary'
}];

export default Ember.Component.extend({
  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  initStepIndex: 0,

  _isInProcess: false,

  // TODO: i18n
  steps: [],

  init() {
    this._super(...arguments);
    let onepanelServiceType = this.get('onepanelServiceType');
    this.set('_isInProcess', this.get('initStepIndex') > 0);
    this.set('steps', onepanelServiceType === 'provider' ? STEPS_PROVIDER : STEPS_ZONE);
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
