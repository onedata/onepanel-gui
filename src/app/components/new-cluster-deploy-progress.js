/**
 * Shows status of cluster deployment process
 *
 * @module components/new-cluster-deploy-progress
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import _ from 'lodash';

import { default as generateClusterDeploySteps, KNOWN_STEPS } from 'ember-onedata-onepanel-server/utils/cluster-deploy-steps';

const {
  Component,
  computed,
  computed: { readOnly },
  observer,
  inject: { service },
} = Ember;

const RE_STEP = /service_?(.*):(.*)/;

// TODO this can be made a generic taskStatus progress component
export default Component.extend({
  classNames: ['new-cluster-deploy-progress'],

  onepanelServer: service(),
  onepanelServiceType: readOnly('onepanelServer.serviceType'),

  /**
   * Promise for watching deployment process.
   * @type {jQuery.Promise}
   */
  deploymentPromise: null,

  step: null,
  isDone: false,

  /**
   * Number in range 0..1 - last known progress, in case when there is an unknown
   * step to display between known steps
   * @type {number}
   */
  _lastKnownProgress: undefined,

  stepText: computed('step', function () {
    const {
      step,
      i18n,
    } = this.getProperties('step', 'i18n');
    if (step) {
      const [, service, action] = RE_STEP.exec(step);
      if (_.includes(KNOWN_STEPS, step)) {
        const tservice = service ?
          i18n.t(`components.newClusterDeployProgress.steps.service.${service}`) :
          '';
        return i18n.t(`components.newClusterDeployProgress.steps.action.${action}`, {
          service: tservice,
        });
      } else {
        return step;
      }
    } else {
      return i18n.t('components.newClusterDeployProgress.steps.unknown');
    }
  }),

  clusterDeploySteps: computed('onepanelServiceType', function () {
    // return generateClusterDeploySteps(this.get('onepanelServiceType'));
    return generateClusterDeploySteps(this.get('onepanelServiceType'));
  }),

  /**
   * A progress in range 0..1 for progress bar.
   * @type {computed<number>}
   */
  progress: computed('step', 'isDone', function () {
    if (this.get('isDone')) {
      return 1;
    } else {
      const step = this.get('step');
      const clusterDeploySteps = this.get('clusterDeploySteps');
      const stepIndex = clusterDeploySteps.indexOf(step);
      if (stepIndex !== -1) {
        const progress = stepIndex / clusterDeploySteps.length;
        this.set('_lastKnownProgress', progress);
        return progress;
      } else {
        return this.get('_lastKnownProgress');
      }
    }
  }),

  init() {
    this._super(...arguments);
    this.bindDeploymentEvents();
  },

  /**
   * Add callbacks for deployment promise.
   */
  bindDeploymentEvents: observer('deploymentPromise', function () {
    let deployment = this.get('deploymentPromise');
    if (deployment) {
      deployment.progress(taskStatus => {
        this.handleProgress(taskStatus);
      });
      deployment.done(taskStatus => {
        this.handleDone(taskStatus);
      });
    }
  }),

  /**
   * Use `TaskStatus` from deployment promise progress callback. 
   * @param {Onepanel.TaskStatus} taskStatus
   * @returns {undefined}
   */
  handleProgress(taskStatus) {
    let doneSteps = taskStatus.steps;
    let lastStep = doneSteps[doneSteps.length - 1];
    this.set('step', lastStep);
  },

  /**
   * Handle done event of deployment promise.
   * @returns {undefined}
   */
  handleDone() {
    this.set('isDone', true);
  },
});
