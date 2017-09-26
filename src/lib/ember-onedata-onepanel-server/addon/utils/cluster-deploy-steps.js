/**
 * Generate known step names of cluster deployment process
 *
 * @module utils/cluster-deploy-steps
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const COMMON_DEPLOY_STEPS = [
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
];

const WORKER_STEPS = [
  'configure',
  'setup_certs',
  'stop',
  'start',
  'wait_for_init',
  'status',
];

/**
 * Generate list of specific deployment steps for specific worker service
 * @param {string} type one of: "zone", "provider"
 * @returns {Array<string>} full worker step names
 */
function workerSteps(type) {
  // currently - just first letter
  let typeCode = type[0];
  return WORKER_STEPS.map(ws => `service_o${typeCode}_worker:${ws}`);
}

/**
 * Generate list of all deployment steps for specific worker service
 * @param {string} type one of: "zone", "provider"
 * @returns {Array<string>}
 */
function clusterDeploySteps(type) {
  return COMMON_DEPLOY_STEPS.concat(workerSteps(type));
}

export default clusterDeploySteps;
