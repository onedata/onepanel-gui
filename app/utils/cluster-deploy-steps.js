const CLUSTER_DEPLOY_STEPS = [
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
  'service_op_worker:configure',
  'service_op_worker:setup_certs',
  'service_op_worker:stop',
  'service_op_worker:start',
  'service_op_worker:wait_for_init',
  'service_op_worker:status'
];

export default CLUSTER_DEPLOY_STEPS;
