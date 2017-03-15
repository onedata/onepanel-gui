export default [
  { name: 'adminAccessKey', type: 'text' },
  { name: 'adminSecretKey', type: 'password' },
  { name: 'hostname', type: 'text', defaultValue: 's3.amazonaws.com' },
  { name: 'bucketName', type: 'text' },
  { name: 'blockSize', type: 'number', optional: true },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'readonly', type: 'checkbox' },
  { name: 'insecure', type: 'checkbox' }
];
