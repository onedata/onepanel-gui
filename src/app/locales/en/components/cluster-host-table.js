import oneS3Port from './cluster-host-table/one-s3-port';

export default {
  headers: {
    hosts: 'Hosts',
    database: 'Database',
    clusterWorker: 'Cluster Worker',
    clusterManager: 'Cluster Manager',
    primaryClusterManager: 'Primary Cluster Manager',
    oneS3: 'OneS3',
    optional: '(optional)',
  },
  removingHost: 'removing host from list',
  mobileOneS3Port: 'OneS3 port:',
  oneS3Port,
};
