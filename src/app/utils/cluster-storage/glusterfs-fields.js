export default [
  { name: 'volume', type: 'text' },
  { name: 'hostname', type: 'text' },
  { name: 'port', type: 'number', optional: true },
  {
    name: 'transport',
    type: 'radio-group',
    defaultValue: 'tcp',
    options: [
      { value: 'tcp', label: 'TCP' },
      { value: 'rdma', label: 'RDMA' },
      { value: 'socket', label: 'socket' },
    ],
  },
  { name: 'mountPoint', type: 'text', optional: true },
  { name: 'xlatorOptions', type: 'text', optional: true },
  { name: 'timeout', type: 'number', optional: true },
];
