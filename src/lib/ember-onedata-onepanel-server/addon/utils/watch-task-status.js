/**
 * Periodically checks the status of server task using REST API, eg. of deployment
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Onepanel from 'onepanel';

const {
  TaskStatus: {
    StatusEnum,
  },
} = Onepanel;

const {
  Deferred,
} = $;

function getAndHandleTaskStatus(onepanelServer, taskId, deferred, scheduleSelf) {
  const gettingTaskStatus = onepanelServer.request('ClusterApi', 'getTaskStatus', taskId);

  gettingTaskStatus.then(({
    data: taskStatus,
  }) => {
    switch (taskStatus.status) {
      case StatusEnum.ok:
      case StatusEnum.error:
        deferred.resolve(taskStatus);
        break;
      case StatusEnum.running:
        deferred.notify(taskStatus);
        scheduleSelf();
        break;
      default:
        console.warn('watchTaskStatus: invalid taskStatus: ' + JSON.serialize(
          'taskStatus'));
        scheduleSelf();
        break;
    }
  });

  gettingTaskStatus.catch(error => {
    console.error(
      'component:new-cluster-installation: getting status of task failed: ' +
      JSON.stringify(error)
    );
    deferred.reject(error);
  });
}

/**
 * Periodically checks the status of task.
 *
 * Invokes passed callbacks on status events.
 *
 * @param {OnepanelServer} onepanelServer
 * @param {string} taskId
 * @param {number} [interval] interval of requests in ms
 * @returns {jQuery.Promise} it has additional property: `taskId` which stores
 *    passed taskId
 */
function watchTaskStatus(onepanelServer, taskId, interval = 1000) {
  const deferred = new Deferred();

  // TODO: should we stop on getStatusError? - maybe failure counter

  const scheduleTaskCheck = () => {
    setTimeout(() => getAndHandleTaskStatus(onepanelServer, taskId, deferred,
      scheduleTaskCheck), interval);
  };

  scheduleTaskCheck();

  const promise = deferred.promise();
  promise.taskId = taskId;
  return promise;
}

export default watchTaskStatus;
