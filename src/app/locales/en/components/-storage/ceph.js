export default {
  username: { name: 'Username' },
  key: { name: 'Key' },
  monitorHostname: {
    name: 'Monitor hostname',
    tip: 'The hostname (IP address or FQDN) of the Ceph monitor service.',
  },
  clusterName: {
    name: 'Cluster name',
    tip: 'The name of the Ceph storage cluster.',
  },
  poolName: {
    name: 'Pool name',
    tip: 'The name of the Ceph pool – the logical partition for object storage.',
  },
  timeout: { name: 'Timeout [ms]' },
};
