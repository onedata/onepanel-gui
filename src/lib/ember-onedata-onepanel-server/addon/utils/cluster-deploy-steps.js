/**
 * Generate known step names of cluster deployment process
 *
 * @module utils/cluster-deploy-steps
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
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

const CEPH_STEPS = [
  'service_ceph:configure',
  'service_ceph:setup_keyring',
  'service_ceph:extend_cluster',
  'service_ceph_mon:create_monmap',
  'service_ceph_mon:setup_keyring',
  'service_ceph_mon:mkfs',
  'service_ceph_mon:start',
  'service_ceph_mon:register',
  'service_ceph_mgr:setup_keyring',
  'service_ceph_mgr:start',
  'service_ceph_osd:create',
  'service_ceph_osd:format',
  'service_ceph_osd:mkfs',
  'service_ceph_osd:register',
  'service_ceph_osd:start',
  'service_ceph:create_pool',
  'service_ceph:set_pool_replication',
  'service_ceph:add_pool_as_storage',
  'service_ceph:cleanup',
];

/**
 * Generate list of specific deployment steps for specific worker service
 * @param {string} type one of: "zone", "provider"
 * @returns {Array<string>} full worker step names
 */
function workerSteps(type) {
  // `z` for zone and `p` for provider
  const typeCode = type[0];
  const steps = WORKER_STEPS.map(ws => `service_o${typeCode}_worker:${ws}`);

  if (type === 'provider') {
    steps.push(...CEPH_STEPS);
  }

  return steps;
}

/**
 * Generate list of all deployment steps for specific worker service
 * @param {string} type one of: "zone", "provider"
 * @returns {Array<string>}
 */
export default function clusterDeploySteps(type) {
  return COMMON_DEPLOY_STEPS.concat(workerSteps(type));
}

export const KNOWN_STEPS = COMMON_DEPLOY_STEPS.concat(
  workerSteps('provider'),
  workerSteps('zone'),
);
