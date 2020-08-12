export default [{
  name: 'username',
  type: 'text',
}, {
  name: 'password',
  type: 'password',
}, {
  name: 'authUrl',
  type: 'text',
}, {
  name: 'containerName',
  type: 'text',
}, {
  name: 'tenantName',
  type: 'text',
}, {
  name: 'blockSize',
  type: 'number',
  optional: true,
  example: '10485760',
  notEditable: true,
}, {
  name: 'timeout',
  type: 'number',
  optional: true,
}];
