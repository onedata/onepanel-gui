import Onepanel from 'npm:onepanel';

const {
  TaskStatus: {
    StatusEnum
  }
} = Onepanel;

const {
  Deferred
} = $;

function getAndHandleTaskStatus(onepanelServer, taskId, deferred, scheduleSelf) {
  let gettingTaskStatus = onepanelServer.request('onepanel', 'getTaskStatus', taskId);

  gettingTaskStatus.then(({
    data: taskStatus
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
        console.warn('watchTaskStatus: invalid taskStatus: ' + JSON.serialize('taskStatus'));
        scheduleSelf();
        break;
    }
  });

  gettingTaskStatus.catch(error => {
    console.error('component:new-cluster-installation: getting status of task failed: ' + JSON.stringify(error));
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
 * @return {jQuery.Promise}
 */
function watchTaskStatus(onepanelServer, taskId, interval = 1000) {
  let deferred = new Deferred();

  // TODO: should we stop on getStatusError? - maybe failure counter

  let scheduleTaskCheck = () => {
    setTimeout(() => getAndHandleTaskStatus(onepanelServer, taskId, deferred, scheduleTaskCheck), interval);
  };

  scheduleTaskCheck();

  return deferred.promise();
}

export default watchTaskStatus;
