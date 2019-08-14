/**
 * Renders new cluster deployment process (steps bar and their content)
 *
 * Invokes actions:
 * - transitionTo(*any) - passes the action down
 *
 * @module components/new-cluster
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { readOnly } from '@ember/object/computed';
import { get, set, computed } from '@ember/object';
import Onepanel from 'npm:onepanel';
import { invokeAction } from 'ember-invoke-action';
import { InstallationStepsMap, InstallationStepsArray } from 'onepanel-gui/models/installation-details';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import { array, raw } from 'ember-awesome-macros';

const {
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const stepsOneprovider = InstallationStepsArray.filterBy('inOneprovider');
const stepsOnezone = InstallationStepsArray.filterBy('inOnezone');

const COOKIE_DEPLOYMENT_TASK_ID = 'deploymentTaskId';

export default Component.extend(I18n, {
  onepanelServer: service(),
  cookies: service(),
  deploymentManager: service(),
  providerManager: service(),
  guiUtils: service(),

  i18nPrefix: 'components.newCluster',

  onepanelServiceType: readOnly('guiUtils.serviceType'),

  currentStep: InstallationStepsMap.deploy,

  _isInProcess: false,

  /**
   * @type {boolean}
   */
  isLoading: false,

  /**
   * If true, ceph step will be visible (only oneprovider)
   * @type {boolean}
   */
  showCephStep: false,

  /**
   * Data passed to initialize step component. Used to persist step state
   * @type {any}
   */
  stepData: undefined,

  /**
   * @type {Ember.ComputedProperty<Array<InstallationStep>>}
   */
  allSteps: computed('onepanelServiceType', 'showCephStep', function steps() {
    const {
      onepanelServiceType,
      showCephStep,
    } = this.getProperties('onepanelServiceType', 'showCephStep');
    let stepsArray = onepanelServiceType === 'oneprovider' ?
      stepsOneprovider : stepsOnezone;
    if (!showCephStep) {
      stepsArray = stepsArray.without(InstallationStepsMap.oneproviderCeph);
    }
    stepsArray.forEach(step => set(
      step,
      'title',
      this.t(`steps.${onepanelServiceType}.${get(step, 'name')}`))
    );
    return stepsArray;
  }),

  /**
   * @type {Ember.ComputedProperty<Array<InstallationStep>>}
   */
  steps: array.rejectBy('allSteps', raw('isHiddenStep')),

  /**
   * @type {Window.Location}
   */
  _location: location,

  wizardIndex: computed(
    'allSteps.[]',
    'steps.[]',
    'currentStep',
    function wizardIndex() {
      const {
        steps,
        currentStep,
      } = this.getProperties('steps', 'currentStep');
      let stepToSearch = currentStep;
      if (steps.indexOf(stepToSearch) === -1) {
        stepToSearch = this.getPrevStep(stepToSearch);
      }
      return steps.indexOf(stepToSearch);
    }
  ),

  isAfterDeploy: computed('currentStep', function getIsAfterDeploy() {
    return this.get('currentStep').gt(InstallationStepsMap.oneproviderRegister);
  }),

  /**
   * @type {PromiseObject<ProviderDetails>}
   */
  providerDetailsProxy: computed('isAfterDeploy', function providerDetailsProxy() {
    if (
      this.get('isAfterDeploy') &&
      this.get('onepanelServiceType') === 'oneprovider'
    ) {
      return this.get('providerManager').getProviderDetailsProxy();
    }
  }),

  init() {
    this._super(...arguments);
    let clusterInitStep = this.get('cluster.initStep');
    this.setProperties({
      currentStep: clusterInitStep,
      _isInProcess: clusterInitStep.gt(InstallationStepsMap.deploy),
    });
    if (clusterInitStep === InstallationStepsMap.deploy) {
      this.set('isLoading', true);
      this._checkUnfinishedDeployment()
        .then(taskId => {
          if (!this.isDestroyed && taskId) {
            this.setProperties({
              deploymentTaskId: taskId ? taskId : undefined,
              _isInProcess: true,
              currentStep: InstallationStepsMap.deploymentProgress,
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
          const {
            currentStep,
            steps,
          } = this.getProperties('currentStep', 'steps');
          switch (status) {
            case StatusEnum.running:
              return deploymentTaskId;
            case StatusEnum.ok:
              if (currentStep.lte(InstallationStepsMap.deploymentProgress)) {
                const afterDeployProgress = steps[steps.indexOf(currentStep) + 1];
                cookies.clear(COOKIE_DEPLOYMENT_TASK_ID);
                this.set('cluster.initStep', afterDeployProgress);
                this.setProperties({
                  _isInProcess: true,
                  currentStep: afterDeployProgress,
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
   * @param {any} stepData data that will be passed to the next step
   * @returns {undefined}
   */
  _next(stepData) {
    const {
      currentStep,
      guiUtils,
      _location,
    } = this.getProperties(
      'currentStep',
      'guiUtils',
      '_location',
    );

    const serviceType = get(guiUtils, 'serviceType');
    const isOneprovider = serviceType === 'oneprovider';
    const isProviderAfterRegister =
      currentStep === InstallationStepsMap.oneproviderRegister;
    const isZoneAfterDeploy = !isOneprovider &&
      currentStep.lte(InstallationStepsMap.deploymentProgress);

    if (isProviderAfterRegister || isZoneAfterDeploy) {
      // Reload whole application to fetch info about newly deployed cluster
      _location.reload();
    } else {
      const nextStep = this.getNextStep(currentStep);
      this.set('cluster.initStep', nextStep);
      this.set('currentStep', nextStep);
      this.setProperties({
        stepData,
        currentStep: nextStep,
      });
    }
  },

  _prev(stepData) {
    const nextStep = this.getPrevStep(this.get('currentStep'));
    this.set('cluster.initStep', nextStep);
    this.setProperties({
      stepData,
      currentStep: nextStep,
    });
  },

  getNextStep(step) {
    const steps = this.get('steps');
    if (steps.indexOf(step) === -1) {
      // fallback to the nearest visible step
      step = this.getPrevStep(step);
    }
    return steps[steps.indexOf(step) + 1];
  },

  getPrevStep(step) {
    const {
      allSteps,
      steps,
    } = this.getProperties('allSteps', 'steps');

    if (steps.indexOf(step) === -1) {
      const allStepsIndex = allSteps.indexOf(step);
      for (let i = allStepsIndex; i >= 0; i--) {
        if (steps.indexOf(allSteps[i]) !== -1) {
          return allSteps[i];
        }
      }
    } else {
      return steps[steps.indexOf(step) - 1];
    }
  },

  actions: {
    next(stepData) {
      $('.col-content').scrollTop(0);
      this._next(stepData);
    },
    prev(stepData) {
      $('.col-content').scrollTop(0);
      this._prev(stepData);
    },
    finishInitProcess() {
      return invokeAction(this, 'finishInitProcess');
    },
  },
});
