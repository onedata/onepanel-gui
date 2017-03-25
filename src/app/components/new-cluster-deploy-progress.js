/**
 * Shows status of cluster deployment process
 *
 * @module components/new-cluster-deploy-progress
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import config from 'ember-get-config';
import generateClusterDeploySteps from 'ember-onedata-onepanel-server/utils/cluster-deploy-steps';

const {
  computed,
  observer
} = Ember;

const {
  onepanelConfig: {
    ONEPANEL_SERVICE_TYPE
  }
} = config;

// TODO this can be made a generic taskStatus progress component
export default Ember.Component.extend({
  classNames: ['new-cluster-deploy-progress'],

  /**
   * Promise for watching deployment process.
   * @type {jQuery.Promise}
   */
  deploymentPromise: null,

  step: null,
  isDone: false,

  clusterDeploySteps: computed(function () {
    return generateClusterDeploySteps(ONEPANEL_SERVICE_TYPE);
  }).readOnly(),

  /**
   * A progress in range 0..1 for progress bar.
   * @type {computed<number>}
   */
  progress: computed('step', 'isDone', function () {
    if (this.get('isDone')) {
      return 1;
    } else {
      let step = this.get('step');
      let clusterDeploySteps = this.get('clusterDeploySteps');
      let stepIndex = clusterDeploySteps.indexOf(step);
      if (stepIndex !== -1) {
        return stepIndex / clusterDeploySteps.length;
      } else {
        // TODO handle invalid/not known steps
        return undefined;
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
   * Use ``TaskStatus`` from deployment promise progress callback. 
   * @param {Onepanel.TaskStatus} taskStatus 
   */
  handleProgress(taskStatus) {
    let doneSteps = taskStatus.steps;
    let lastStep = doneSteps[doneSteps.length - 1];
    this.set('step', lastStep);
  },

  /**
   * Handle done event of deployment promise.
   */
  handleDone() {
    this.set('isDone', true);
  },
});
