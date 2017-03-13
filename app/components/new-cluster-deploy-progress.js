import Ember from 'ember';

const CLUSTER_DEPLOY_STEPS = [
  'service_couchbase:configure',
  'service_couchbase:start',
  'service_couchbase:wait_for_init',
  'service_couchbase:init_cluster',
  'service_couchbase:rebalance_cluster',
  'service_couchbase:status',
  'service:save',
  'service_cluster_manager:configure',
  'service_cluster_manager:stop',
  'service_cluster_manager:start',
  'service_cluster_manager:status',
  'service_op_worker:configure',
  'service_op_worker:setup_certs',
  'service_op_worker:stop',
  'service_op_worker:start',
  'service_op_worker:wait_for_init',
  'service_op_worker:status'
];

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
