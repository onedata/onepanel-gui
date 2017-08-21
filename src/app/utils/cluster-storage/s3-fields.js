export default [
  { name: 'accessKey', type: 'text' },
  { name: 'secretKey', type: 'password' },
  { name: 'hostname', type: 'text', defaultValue: 's3.amazonaws.com' },
  { name: 'bucketName', type: 'text' },
  {
    name: 'signatureVersion',
    type: 'radio-group',
    defaultValue: 4,
    options: [
      { value: 4, label: '4' },
      { value: 2, label: '2' },
    ],
  },
  { name: 'blockSize', type: 'number', optional: true },
  { name: 'timeout', type: 'number', optional: true },
  { name: 'readonly', type: 'checkbox', optional: true },
  { name: 'insecure', type: 'checkbox', optional: true },
];
