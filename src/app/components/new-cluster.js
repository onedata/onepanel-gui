/**
 * Renders new cluster deployment process (steps bar and their content)
 *
 * Invokes actions:
 * - transitionTo(*any) - passes the action down
 *
 * @module components/new-cluster
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import Onepanel from 'npm:onepanel';
import { invokeAction } from 'ember-invoke-action';

const {
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

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

export default Component.extend({
  onepanelServer: service(),
  cookies: service(),
  clusterManager: service(),

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  currentStepIndex: 0,

  _isInProcess: false,

  /**
   * @type {boolean}
   */
  isLoading: false,

  // TODO: i18n
  steps: Object.freeze([]),

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
   * Checks if there is saved task in cookies for checking for deployment status.
   * Should be invoked only if the clusterInitStep is 0!
   * @returns {Promise} resolves with deployment task ID if the deployment is in progress;
   *   resolves with undefined if there is no (known for us) deployment in progress;
   *   if there is a request error it resolves with undefined (eg. when task status cannot be fetched)
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
          switch (status) {
            case StatusEnum.running:
              return deploymentTaskId;
            case StatusEnum.ok:
              if (this.get('currentStepIndex') < 1) {
                cookies.clear(COOKIE_DEPLOYMENT_TASK_ID);
                this.set('cluster.initStep', 1);
                this.setProperties({
                  _isInProcess: true,
                  currentStepIndex: 1,
                });
              }
              return undefined;
            case StatusEnum.error:
            default:
              cookies.clear(COOKIE_DEPLOYMENT_TASK_ID);
              return undefined;
          }
        })
        .catch(() => {
          cookies.clear(COOKIE_DEPLOYMENT_TASK_ID);
          return undefined;
        });
    } else {
      return Promise.resolve(undefined);
    }
  },

  /**
   * Go to next deployment step
   */
  _next() {
    const nextStep = nextInt(this.get('currentStepIndex'));
    this.set('cluster.initStep', nextStep);
    this.set('currentStepIndex', nextStep);
  },

  actions: {
    next() {
      this._next();
    },
    changeClusterName(name) {
      if (!name) {
        this.get('clusterManager')
          .getClusterDetails(this.get('cluster.id'), true)
          .then(cluster => get(cluster, 'name'));
      } else {
        this.set('cluster.name', name);
      }
    },
    finishInitProcess() {
      return invokeAction(this, 'finishInitProcess');
    },
  },
});

/**
 * Returns next integer for given number (e.g. 1 => 2; 1.3 => 2; 1.6 => 2)
 * @param {number} i
 * @returns {number} an integer
 */
function nextInt(i) {
  return Math.floor(i + 1);
}
