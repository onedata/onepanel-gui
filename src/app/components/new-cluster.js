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
  computed,
  computed: { readOnly },
} = Ember;

const STEPS_PROVIDER = [{
  id: 'installation',
  title: 'cluster installation',
}, {
  id: 'provider-registration',
  title: 'zone registration',
}, {
  id: 'provider-storage',
  title: 'storage configuration',
}, {
  id: 'summary',
  title: 'summary',
}];

const STEPS_ZONE = [{
  id: 'installation',
  title: 'cluster installation',
}, {
  id: 'summary',
  title: 'summary',
}];

const COOKIE_DEPLOYMENT_TASK_ID = 'deploymentTaskId';

export default Ember.Component.extend({
  onepanelServer: service(),
  cookies: service(),

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  currentStepIndex: 0,

  _isInProcess: false,

  /**
   * @type {boolean}
   */
  isLoading: false,

  // TODO: i18n
  steps: [],

  wizardIndex: computed('currentStepIndex', function () {
    return Math.floor(this.get('currentStepIndex'));
  }),

  init() {
    this._super(...arguments);
    let onepanelServiceType = this.get('onepanelServiceType');
    let clusterInitStep = this.get('cluster.initStep');
    this.setProperties({
      currentStepIndex: clusterInitStep,
      _isInProcess: clusterInitStep > 0,
      steps: onepanelServiceType === 'provider' ? STEPS_PROVIDER : STEPS_ZONE,
    });
    if (clusterInitStep === 0) {
      this.set('isLoading', true);
      this._checkUnfinishedDeployment()
        .then(taskId => {
          if (!this.isDestroyed && taskId) {
            this.setProperties({
              deploymentTaskId: taskId ? taskId : undefined,
              _isInProcess: true,
              currentStepIndex: 0.5,
            });
          }
        })
        .finally(() => !this.isDestroyed && this.set('isLoading', false));
    }
  },

  /**
   * Checks if there is saved task in cookies for checking for deployment status
   * @returns {Promise} resolves with deployment task ID if the deployment is in progress;
   *   resolves with false if there is no (known for us) deployment in progress;
   *   if there is a request error it resolves with false (eg. when task status cannot be fetched)
   */
  _checkUnfinishedDeployment() {
    const {
      cookies,
      onepanelServer,
    } = this.getProperties('cookies', 'onepanelServer');
    const deploymentTaskId = cookies.read(COOKIE_DEPLOYMENT_TASK_ID);
    if (deploymentTaskId) {
      return onepanelServer.request('onepanel', 'getTaskStatus', deploymentTaskId)
        .then(({ data: { status } }) => {
          return status === 'running' ? deploymentTaskId : false;
        })
        .catch(() => {
          cookies.clear(COOKIE_DEPLOYMENT_TASK_ID);
          return false;
        });
    } else {
      return Promise.resolve(false);
    }
  },

  actions: {
    next() {
      const nextStep = nextInt(this.get('currentStepIndex'));
      this.set('cluster.initStep', nextStep);
      this.set('currentStepIndex', nextStep);
    },
    changeClusterName(name) {
      this.set('cluster.name', name);
    },
    finishInitProcess() {
      return invokeAction(this, 'finishInitProcess');
    },
  },
});

function nextInt(i) {
  return Number.isInteger(i) ? (i + 1) : Math.ceil(i);
}
