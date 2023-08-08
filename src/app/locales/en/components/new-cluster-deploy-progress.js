export default {
  deploying: 'Deploying cluster, please wait...',
  stage: 'Stage',
  steps: {
    unknown: '...',
    service: {
      couchbase: 'Couchbase',
      cluster_manager: 'Cluster Manager',
      oz_worker: 'Onezone Worker',
      op_worker: 'Oneprovider Worker',
      oneprovider: 'Oneprovider',
      onezone: 'Onezone',
    },
    action: {
      configure: 'configuring {{service}}',
      start: 'starting {{service}}',
      wait_for_init: 'waiting for {{service}} initialization',
      init_cluster: 'initializing {{service}} cluster',
      rebalance_cluster: 'rebalancing {{service}} cluster',
      save: 'saving {{service}}',
      stop: 'stopping {{service}}',
      setup_certs: 'setting up {{service}} certificates',
      set_up_service_in_onezone: 'setting up web GUI',
    },
  },
};
