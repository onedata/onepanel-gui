/**
 * Shows status of cluster deployment process
 *
 * @module components/new-cluster-deploy-progress
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { readOnly } from '@ember/object/computed';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';

import {
  default as generateClusterDeploySteps,
  KNOWN_STEPS,
} from 'ember-onedata-onepanel-server/utils/cluster-deploy-steps';

const RE_STEP = /service_?(.*):(.*)/;
const I18N_PREFIX_STEPS = 'components.newClusterDeployProgress.steps.';

// TODO this can be made a generic taskStatus progress component
export default Component.extend({
  guiUtils: service(),

  classNames: ['new-cluster-deploy-progress'],

  onepanelServiceType: readOnly('guiUtils.serviceType'),

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

  /**
   * Translated step description
   * @type {string}
   */
  stepText: computed('step', function getStepText() {
    const {
      step,
      i18n,
    } = this.getProperties('step', 'i18n');
    if (step) {
      const [, service, action] = RE_STEP.exec(step);
      if (_.includes(KNOWN_STEPS, step)) {
        const tservice = service ?
          i18n.t(`${I18N_PREFIX_STEPS}service.${service}`) :
          '';
        return i18n.t(`${I18N_PREFIX_STEPS}action.${action}`, {
          service: tservice,
        });
      } else {
        return step;
      }
    } else {
      return i18n.t(`${I18N_PREFIX_STEPS}unknown`);
    }
  }),

  clusterDeploySteps: computed('onepanelServiceType', function () {
    return generateClusterDeploySteps(this.get('onepanelServiceType'));
  }),

  /**
   * A progress in range 0..1 for progress bar.
   * @type {computed<number>}
   */
  progress: computed('step', 'isDone', 'clusterDeploySteps', function getProgress() {
    const {
      isDone,
      step,
      clusterDeploySteps,
    } = this.getProperties('isDone', 'step', 'clusterDeploySteps');
    if (isDone) {
      return 1;
    } else {
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
