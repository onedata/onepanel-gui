/**
 * Mock for reading status of deploy cluster task
 *
 * @module models/deployment-progress-mock
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';

import Onepanel from 'npm:onepanel';
import generateClusterDeploySteps from 'ember-onedata-onepanel-server/utils/cluster-deploy-steps';

const {
  TaskStatus,
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

/**
 * How many steps should be done in one progress state fetch
 * @type {number}
 */
const PROGRESS_SPEED = 4;

export default EmberObject.extend({
  /**
   * To inject.
   * @type {string}
   */
  onepanelServiceType: null,

  onepaneServiceType: null,
  fakeProgress: 0,

  clusterDeploySteps: computed(function () {
    return generateClusterDeploySteps(this.get('onepanelServiceType'));
  }).readOnly(),

  /**
   * Mocks getTaskStatus for cluster configuration operation.
   *
   * Every time it is invoked, it returns TaskStatus with more steps.
   * 
   * @returns {Onepanel.TaskStatus}
   */
  getTaskStatusConfiguration() {
    const {
      clusterDeploySteps,
      fakeProgress,
    } = this.getProperties('clusterDeploySteps', 'fakeProgress');
    const totalSteps = get(clusterDeploySteps, 'length');

    this.incrementProperty('fakeProgress', PROGRESS_SPEED);

    return TaskStatus.constructFromObject({
      status: (fakeProgress >= totalSteps) ?
        StatusEnum.ok : StatusEnum.running,
      steps: clusterDeploySteps.slice(0, fakeProgress),
      totalSteps: totalSteps,
    });
  },
});
