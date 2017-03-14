import Onepanel from 'npm:onepanel';

const {
  TaskStatus: {
    StatusEnum
  }
} = Onepanel;

const {
  Deferred
} = $;

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
  let selfArguments = arguments;
  let gettingTaskStatus = onepanelServer.request('onepanel', 'getTaskStatus', taskId);
  let deferSelf = (timeout) => {
    setTimeout(() => watchTaskStatus(...selfArguments), timeout);
  };

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
        deferSelf(interval);
        break;
      default:
        console.warn('watchTaskStatus: invalid taskStatus: ' + JSON.serialize('taskStatus'));
        deferSelf(interval);
        break;
    }
  });

  gettingTaskStatus.catch(error => {
    console.error('component:new-cluster-installation: getting status of task failed: ' + JSON.stringify(error));
    deferred.reject(error);
  });

  return deferred.promise();
}

export default watchTaskStatus;
