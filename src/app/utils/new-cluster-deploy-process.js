/**
 * A util that controls process of cluster deployment
 *
 * It can start new deployment by setting configuration field and calling
 * startDeploy() or can monitor existing deploy process using method
 * watchExistingDeploy(taskId).
 *
 * @module utils/new-cluster-deploy-process
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { assert } from '@ember/debug';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { camelize } from '@ember/string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import Onepanel from 'npm:onepanel';
import shortServiceType from 'onepanel-gui/utils/short-service-type';

const {
  ProviderConfiguration,
  ZoneConfiguration,
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const cookieDeploymentTaskId = 'deploymentTaskId';

export default EmberObject.extend({
  globalNotify: service(),
  guiUtils: service(),
  onepanelServer: service(),
  cookies: service(),

  /**
   * Configuration object. It should be suitable for
   * (Zone|Provider)Configuration.constructFromObject method.
   * @virtual
   * @type {object}
   */
  configuration: undefined,

  /**
   * Array of hostnames where ceph will be placed. Can be used as an additional
   * property to list ceph nodes without deep understanding of ceph config structure.
   * Should be updated every time list of ceph nodes changes.
   * @type {Array<string>}
   */
  cephNodes: Object.freeze([]),

  /**
   * Called when deployment has finished successfully.
   * @virtual optional
   * @type {function}
   * @returns {undefined}
   */
  onFinish: notImplementedIgnore,

  /**
   * Deployment promise (task)
   * @type {jQuery.Promise}
   */
  deploymentPromise: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  onepanelServiceType: reads('guiUtils.serviceType'),

  /**
   * Configuration class proper for onepanel service (zone or provider)
   * @type {Ember.ComputedProperty<object>}
   */
  configurationClass: computed('onepanelServiceType', function configurationClass() {
    return this.get('onepanelServiceType') === 'zone' ?
      ZoneConfiguration : ProviderConfiguration;
  }),

  /**
   * Starts watching deployment identified by taskId.
   * @param {string} taskId 
   * @returns {undefined};
   */
  watchExistingDeploy(taskId) {
    const task = watchTaskStatus(this.get('onepanelServer'), taskId);
    this.set('deploymentPromise', task);
    this.watchDeployStatus(task);
  },

  /**
   * Starts deployment process.
   *
   * When process starts successfully, a deployment promise
   * is bound to success/failure handlers.
   * 
   * Returned promise resolves when backend started deployment.
   * 
   * @returns {Promise}
   */
  startDeploy() {
    const {
      onepanelServer,
      onepanelServiceType,
      configurationClass,
      configuration,
      globalNotify,
    } = this.getProperties(
      'onepanelServer',
      'onepanelServiceType',
      'configurationClass',
      'configuration',
      'globalNotify'
    );
    const start = new Promise((resolve, reject) => {
      const config = configurationClass.constructFromObject(configuration);
      onepanelServer.request(
        onepanelServiceType,
        camelize(`configure-${shortServiceType(onepanelServiceType)}`),
        config
      ).then(resolve, reject);
    });
    start.then(({ task }) => {
      this.storeTask(task.taskId);
      this.set('deploymentPromise', task);
      this.watchDeployStatus(task);
    });
    start.catch(error => {
      globalNotify.backendError('deployment start', error);
    });
    return start;
  },

  /**
   * Bind on events of deployment task. 
   * @param {jQuery.Promise} task
   * @returns {undefined}
   */
  watchDeployStatus(task) {
    task.done(taskStatus => {
      this.clearStoredTask();
      if (taskStatus.status === StatusEnum.ok) {
        this.finished();
      } else {
        this.failed(taskStatus);
      }
    });
    task.fail(error => this.failed({ error }));
    task.always(() => this.set('deploymentPromise', null));
  },

  /**
   * Failed deployment handler
   * @param {object} taskStatus
   * @returns {undefined}
   */
  failed(taskStatus) {
    this.get('globalNotify').backendError('cluster deployment', taskStatus.error);
  },

  /**
   * Finished deployment handler
   * @returns {undefined}
   */
  finished() {
    this.get('globalNotify').info('Cluster deployed successfully');
    this.get('onFinish')();
  },

  /**
   * Save deployment server task ID in case if page will be refreshed
   * @param {string} taskId
   */
  storeTask(taskId) {
    assert(
      'component:new-cluster-deploy-process: tried to store empty taskId',
      taskId
    );
    this.get('cookies').write(cookieDeploymentTaskId, taskId);
  },

  /**
   * Clear stored last deployment task ID (deployment task has finished)
   */
  clearStoredTask() {
    this.get('cookies').clear(cookieDeploymentTaskId);
  },
});
