/**
 * A util that controls process of cluster deployment
 *
 * It can start new deployment by setting configuration field and calling
 * startDeploy() or can monitor existing deploy process using method
 * watchExistingDeploy(taskId).
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { assert } from '@ember/debug';
import EmberObject, { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { camelize, capitalize } from '@ember/string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import watchTaskStatus from 'ember-onedata-onepanel-server/utils/watch-task-status';
import Onepanel from 'onepanel';
import shortServiceType from 'onepanel-gui/utils/short-service-type';
import I18n from 'onedata-gui-common/mixins/i18n';
import { Promise } from 'rsvp';

const {
  ProviderConfiguration,
  ZoneConfiguration,
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const cookieDeploymentTaskId = 'deploymentTaskId';

export default EmberObject.extend(I18n, {
  globalNotify: service(),
  guiUtils: service(),
  onepanelServer: service(),
  cookies: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.newClusterDeployProcess',

  /**
   * Configuration object. It should be suitable for
   * (Zone|Provider)Configuration.constructFromObject method.
   * @virtual
   * @type {object}
   */
  configuration: undefined,

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
    return this.get('onepanelServiceType') === 'onezone' ?
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
    this.watchDeployStatus();
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
      const apiName = capitalize(onepanelServiceType) + 'ClusterApi';
      onepanelServer.request(
        apiName,
        camelize(`configure-${shortServiceType(onepanelServiceType)}`),
        config
      ).then(resolve, reject);
    });
    start.then(({ task }) => {
      this.storeTask(task.taskId);
      this.set('deploymentPromise', task);
      this.watchDeployStatus();
    });
    start.catch(error => {
      globalNotify.backendError(this.t('startingDeployment'), error);
    });
    return start;
  },

  /**
   * Bind on events of deployment task.
   * @returns {undefined}
   */
  watchDeployStatus() {
    const task = this.get('deploymentPromise');
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
    this.get('globalNotify').backendError(
      this.t('clusterDeployment'),
      taskStatus.error
    );
  },

  /**
   * Finished deployment handler
   * @returns {undefined}
   */
  finished() {
    this.get('globalNotify').info(this.t('clusterDeploySuccess'));
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
