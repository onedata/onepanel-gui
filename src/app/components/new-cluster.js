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
import { CLUSTER_INIT_STEPS as STEP } from 'onepanel-gui/models/cluster-details';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';

const {
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

/**
 * Order of steps in this array should be the same as in CLUSTER_INIT_STEPS
 * for provider
 */
const STEPS_PROVIDER = [
  'installation',
  'providerRegistration',
  'ips',
  'dns',
  'webCert',
  'providerStorage',
  'summary',
];

/**
 * Order of steps in this array should be the same as in CLUSTER_INIT_STEPS
 * for zone
 */
const STEPS_ZONE = [
  'installation',
  'ips',
  'dns',
  'webCert',
  'summary',
];

const COOKIE_DEPLOYMENT_TASK_ID = 'deploymentTaskId';

export default Component.extend(I18n, {
  onepanelServer: service(),
  cookies: service(),
  configurationManager: service(),
  providerManager: service(),

  i18nPrefix: 'components.newCluster',

  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  currentStepIndex: Number(STEP.DEPLOY),

  _isInProcess: false,

  /**
   * @type {boolean}
   */
  isLoading: false,

  steps: Object.freeze([]),

  wizardIndex: computed('currentStepIndex', function () {
    return Math.floor(this.get('currentStepIndex'));
  }),

  isAfterDeploy: computed('currentStepIndex', function getIsAfterDeploy() {
    return this.get('currentStepIndex') > (STEP.DEPLOY + 1);
  }),

  /**
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: computed('isAfterDeploy', function getProviderDetailsProxy() {
    if (
      this.get('isAfterDeploy') &&
      this.get('onepanelServer.serviceType') === 'provider'
    ) {
      return this.get('providerManager').getProviderDetails();
    }
  }),

  init() {
    this._super(...arguments);
    let onepanelServiceType = this.get('onepanelServiceType');
    let clusterInitStep = this.get('cluster.initStep');
    this.setProperties({
      currentStepIndex: clusterInitStep,
      _isInProcess: clusterInitStep > STEP.DEPLOY,
      steps: (onepanelServiceType === 'provider' ? STEPS_PROVIDER : STEPS_ZONE).map(
        id => ({
          id,
          title: this.t(`steps.${onepanelServiceType}.${id}`),
        })),
    });
    if (clusterInitStep === STEP.DEPLOY) {
      this.set('isLoading', true);
      this._checkUnfinishedDeployment()
        .then(taskId => {
          if (!this.isDestroyed && taskId) {
            this.setProperties({
              deploymentTaskId: taskId ? taskId : undefined,
              _isInProcess: true,
              currentStepIndex: STEP.DEPLOYMENT_PROGRESS,
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

  _prev() {
    const nextStep = prevInt(this.get('currentStepIndex'));
    this.set('cluster.initStep', nextStep);
    this.set('currentStepIndex', nextStep);
  },

  actions: {
    next() {
      $('.col-content').scrollTop(0);
      this._next();
    },
    prev() {
      $('.col-content').scrollTop(0);
      this._prev();
    },
    changeClusterName(name) {
      if (!name) {
        this.get('configurationManager')
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

/**
 * Returns prev integer for given number (e.g. 2 => 1; 3.3 => 2; 4.6 => 3)
 * @param {number} i
 * @returns {number} an integer
 */
function prevInt(i) {
  return Math.floor(i - 1);
}
