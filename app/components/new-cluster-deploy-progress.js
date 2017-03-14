import Ember from 'ember';

import CLUSTER_DEPLOY_STEPS from 'onedata-web-frontend-2/utils/cluster-deploy-steps';

const {
  computed,
  observer
} = Ember;

// TODO this can be made a generic taskStatus progress component
export default Ember.Component.extend({
  classNames: ['new-cluster-deploy-progress'],

  /**
   * Promise for watching deployment process.
   *
   * @type {jQuery.Promise}
   */
  deploymentPromise: null,

  step: null,
  isDone: false,

  progress: computed('step', 'isDone', function () {
    if (this.get('isDone')) {
      return 1;
    } else {
      let step = this.get('step');
      let stepIndex = CLUSTER_DEPLOY_STEPS.indexOf(step);
      if (stepIndex !== -1) {
        return stepIndex / CLUSTER_DEPLOY_STEPS.length;
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

  bindDeploymentEvents: observer('deploymentPromise', function () {
    let deployment = this.get('deploymentPromise');
    if (deployment) {
      deployment.progress(taskStatus => this.handleProgress(taskStatus));
      deployment.done(taskStatus => this.handleDone(taskStatus));
    }
  }),

  /**
   * 
   * @param {Onepanel.TaskStatus} taskStatus 
   */
  handleProgress(taskStatus) {
    let doneSteps = taskStatus.steps;
    let lastStep = doneSteps[doneSteps.length - 1];
    this.set('step', lastStep);
  },

  handleDone() {
    this.set('isDone', true);
  },
});
