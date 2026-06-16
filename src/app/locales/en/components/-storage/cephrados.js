export default {
  username: { label: 'Username' },
  key: { label: 'Key' },
  monitorHostname: {
    label: 'Monitor hostname',
    tip: 'The hostname (IP address or FQDN) of the Ceph monitor service.',
    placeholder: 'Example: monitor.example.com',
  },
  clusterName: {
    label: 'Cluster name',
    tip: 'The name of the Ceph storage cluster.',
  },
  poolName: {
    label: 'Pool name',
    tip: 'The name of the Ceph pool – the logical partition for object storage.',
  },
  blockSize: {
    label: 'Block size [bytes]',
    tip: 'Each file will be split across a number of Ceph RADOS objects of the specified size. For optimal performance, this value should be equal to the object size configured in a given Ceph Storage Cluster (default 4 MiB – 4194304 bytes).',
    placeholder: 'Default: 4194304',
  },
};
