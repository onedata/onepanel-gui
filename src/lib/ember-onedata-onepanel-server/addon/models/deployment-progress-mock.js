/**
 * Mock for reading status of deploy cluster task
 *
 * @module models/deployment-progress-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';
import config from 'ember-get-config';
import generateClusterDeploySteps from 'ember-onedata-onepanel-server/utils/cluster-deploy-steps';

const {
  TaskStatus,
  TaskStatus: {
    StatusEnum
  }
} = Onepanel;

const {
  onepanelConfig: {
    ONEPANEL_SERVICE_TYPE
  }
} = config;

const {
  computed,
} = Ember;

export default Ember.Object.extend({
  fakeProgress: 0,

  clusterDeploySteps: computed(function () {
    return generateClusterDeploySteps(ONEPANEL_SERVICE_TYPE);
  }).readOnly(),

  /**
   * Mocks getTaskStatus for cluster configuration operation.
   *
   * Every time it is invoked, it returns TaskStatus with more steps.
   * 
   * @returns {Onepanel.TaskStatus}
   */
  getTaskStatusConfiguration() {
    let clusterDeploySteps = this.get('clusterDeploySteps');
    let fakeProgress = this.get('fakeProgress');
    this.incrementProperty('fakeProgress');
    return TaskStatus.constructFromObject({
      status: (fakeProgress >= clusterDeploySteps.length) ?
        StatusEnum.ok : StatusEnum.running,
      steps: clusterDeploySteps.slice(0, fakeProgress)
    });
  }
});
