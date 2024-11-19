export default [
  { name: 'username', type: 'text' },
  { name: 'key', type: 'password' },
  { name: 'monitorHostname', type: 'text' },
  { name: 'clusterName', type: 'text' },
  { name: 'poolName', type: 'text' },
  {
    name: 'timeout',
    type: 'number',
    optional: true,
    defaultPlaceholder: 300000,
    isDefault: true,
  },
];
