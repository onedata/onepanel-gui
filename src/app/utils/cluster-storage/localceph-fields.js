export default [
  { name: 'poolName', type: 'text' },
  { name: 'poolSize', type: 'number', defaultValue: 1, gte: 1 },
  { name: 'poolMinSize', type: 'number', defaultValue: 1, gte: 1 },
  { name: 'monitorHostname', type: 'dropdown', options: [] },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'insecure', type: 'checkbox', optional: true },
  { name: 'readonly', type: 'checkbox', optional: true },
];
