export default [
  { name: 'accessKey', type: 'text' },
  { name: 'secretKey', type: 'password' },
  { name: 'hostname', type: 'text', defaultValue: 's3.amazonaws.com' },
  { name: 'bucketName', type: 'text' },
  { name: 'blockSize', type: 'number', optional: true },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'readonly', type: 'checkbox', optional: true },
  { name: 'insecure', type: 'checkbox', optional: true }
];
