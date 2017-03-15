export default [
  { name: 'adminUsername', type: 'text' },
  { name: 'adminPassword', type: 'password' },
  { name: 'authUrl', type: 'text' },
  { name: 'containerName', type: 'text' },
  { name: 'tenantName', type: 'text' },
  { name: 'blockSize', type: 'number' },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'readonly', type: 'checkbox' },
  { name: 'insecure', type: 'checkbox' },
];
