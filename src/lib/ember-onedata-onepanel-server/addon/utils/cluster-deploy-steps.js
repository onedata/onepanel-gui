/**
 * Generate known step names of cluster deployment process
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const commonDeployStepsInitial = [
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
  // TODO: there are additional new steps AFTER worker steps, but these are very short
  // Oneprovider Panel
  // 'service_letsencrypt:create',
  // 'onepanel_deployment:mark_completed',
  // 'service_letsencrypt:disable',
  // 'onepanel_deployment:mark_completed',
  // Onezone Panel
  // before
  // 'service_onepanel:add_users'
  // after
  // 'service_onezone:set_up_ozp_gui',
  // 'service_letsencrypt:create',
  // 'onepanel_deployment:mark_completed',
  // 'service: save',
  // 'service_letsencrypt: disable',
  // 'onepanel_deployment:mark_completed',
];

const workerStepNames = [
  'configure',
  'setup_certs',
  'stop',
  'start',
  'wait_for_init',
  'status',
];

/**
 * Generate list of specific deployment steps for specific worker service
 * @param {string} type one of: "onezone", "oneprovider"
 * @returns {Array<string>} full worker step names
 */
function workerSteps(type) {
  // currently - just first letter
  const typeCode = type[3];
  const steps = workerStepNames.map(ws => `service_o${typeCode}_worker:${ws}`);

  return steps;
}

/**
 * Generate list of all deployment steps for specific worker service
 * @param {string} type one of: "onezone", "oneprovider"
 * @returns {Array<string>}
 */
export default function clusterDeploySteps(type) {
  const steps = commonDeployStepsInitial.concat(workerSteps(type));
  return type === 'oneprovider' ?
    steps.concat('service_oneprovider:set_up_service_in_onezone') : steps;
}

export const KNOWN_STEPS = commonDeployStepsInitial.concat(
  clusterDeploySteps('oneprovider'),
  clusterDeploySteps('onezone'),
);
