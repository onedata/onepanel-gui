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
import { installationStepsMap, installationStepsArray } from 'onepanel-gui/models/installation-details';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import { array, raw } from 'ember-awesome-macros';

const {
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const stepsOneprovider = installationStepsArray.filterBy('inOneprovider');
const stepsOnezone = installationStepsArray.filterBy('inOnezone');

const COOKIE_DEPLOYMENT_TASK_ID = 'deploymentTaskId';

export default Component.extend(I18n, {
  onepanelServer: service(),
  cookies: service(),
  deploymentManager: service(),
  providerManager: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.newCluster',

  /**
   * @type {Utils.InstallationStep}
   */
  currentStep: installationStepsMap.deploy,

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
   * @type {Ember.ComputedProperty<string>}
   */
  onepanelServiceType: readOnly('guiUtils.serviceType'),

  /**
   * @type {Ember.ComputedProperty<Array<InstallationStep>>}
   */
  steps: computed('onepanelServiceType', 'showCephStep', function steps() {
    const {
      onepanelServiceType,
      showCephStep,
    } = this.getProperties('onepanelServiceType', 'showCephStep');
    let stepsArray = onepanelServiceType === 'oneprovider' ?
      stepsOneprovider : stepsOnezone;
    if (!showCephStep) {
      stepsArray = stepsArray.without(installationStepsMap.oneproviderCeph);
    }
    stepsArray.forEach(step => set(
      step,
      'title',
      this.t(`steps.${onepanelServiceType}.${get(step, 'name')}`)));
    return stepsArray;
  }),

  /**
   * @type {Ember.ComputedProperty<Array<InstallationStep>>}
   */
  visibleSteps: array.rejectBy('steps', raw('isHiddenStep')),

  /**
   * @type {Window.Location}
   */
  _location: location,

  wizardIndex: computed(
    'steps.[]',
    'visibleSteps.[]',
    'currentStep',
    function wizardIndex() {
      const {
        visibleSteps,
        currentStep,
      } = this.getProperties('visibleSteps', 'currentStep');
      let stepToSearch = currentStep;
      if (visibleSteps.indexOf(stepToSearch) === -1) {
        stepToSearch = this.getPrevStep(stepToSearch);
      }
      return visibleSteps.indexOf(stepToSearch);
    }
  ),

  isAfterDeploy: computed('currentStep', function isAfterDeploy() {
    return this.get('currentStep').gt(installationStepsMap.oneproviderRegistration);
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
      _isInProcess: clusterInitStep.gt(installationStepsMap.deploy),
    });
    if (clusterInitStep === installationStepsMap.deploy) {
      this.set('isLoading', true);
      this._checkUnfinishedDeployment()
        .then(taskId => {
          if (!this.isDestroyed && taskId) {
            this.setProperties({
              deploymentTaskId: taskId ? taskId : undefined,
              _isInProcess: true,
              currentStep: installationStepsMap.deploymentProgress,
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
      return onepanelServer.request('ClusterApi', 'getTaskStatus', deploymentTaskId)
        .then(({ data: { status } }) => {
          const currentStep = this.get('currentStep');
          switch (status) {
            case StatusEnum.running:
              return deploymentTaskId;
            case StatusEnum.ok:
              if (currentStep.lte(installationStepsMap.deploymentProgress)) {
                const afterDeployProgress = this.getNextStep(currentStep);
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
    const isOneproviderAfterRegister =
      currentStep === installationStepsMap.oneproviderRegistration;
    const isOnezoneAfterDeploy = !isOneprovider &&
      currentStep.lte(installationStepsMap.deploymentProgress);

    if (isOneproviderAfterRegister || isOnezoneAfterDeploy) {
      // Reload whole application to fetch info about newly deployed cluster
      _location.reload();
    } else {
      const nextStep = this.getNextStep(currentStep);
      this.set('cluster.initStep', nextStep);
      this.setProperties({
        stepData,
        currentStep: nextStep,
      });
    }
  },

  /**
   * Go to the previous deployment step
   * @param {any} stepData data that will be passed to the previous step
   * @returns {undefined}
   */
  _prev(stepData) {
    const prevStep = this.getPrevStep(this.get('currentStep'));
    this.set('cluster.initStep', prevStep);
    this.setProperties({
      stepData,
      currentStep: prevStep,
    });
  },

  /**
   * Returns step, that is a next step for passed one. Ignores hidden steps.
   * @param {Utils.InstallationStep} step
   * @returns {Utils.InstallationStep}
   */
  getNextStep(step) {
    const visibleSteps = this.get('visibleSteps');
    if (!visibleSteps.includes(step)) {
      // If passed step is hidden, then fallback to the nearest previous visible
      // step
      step = this.getPrevStep(step);
    }
    return visibleSteps[visibleSteps.indexOf(step) + 1];
  },

  /**
   * Returns step, that is a previous step for passed one. Ignores hidden steps.
   * @param {Utils.InstallationStep} step
   * @returns {Utils.InstallationStep}
   */
  getPrevStep(step) {
    const {
      steps,
      visibleSteps,
    } = this.getProperties('steps', 'visibleSteps');

    // If passed step is not a visible step...
    if (!visibleSteps.includes(step)) {
      const stepsIndex = steps.indexOf(step);
      // then find the closest previous step, which is visible
      for (let i = stepsIndex; i >= 0; i--) {
        if (visibleSteps.indexOf(steps[i]) !== -1) {
          return steps[i];
        }
      }
    } else {
      return visibleSteps[visibleSteps.indexOf(step) - 1];
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
