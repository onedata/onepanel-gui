export default [
  { name: 'username', type: 'text' },
  { name: 'key', type: 'password' },
  { name: 'monitorHostname', type: 'text', example: 'monitor.example.com', tip: true },
  { name: 'clusterName', type: 'text', tip: true },
  { name: 'poolName', type: 'text', tip: true },
  {
    name: 'timeout',
    type: 'number',
    optional: true,
    defaultPlaceholder: 300000,
    isDefault: true,
  },
];
