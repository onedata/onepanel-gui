export default [{
    name: 'host',
    type: 'text',
    tip: true,
    // NOTE: there is no regex validation, because of hidden, unstable feature
    // of providing multiple hostnames
    example: 'nfs.example.com',
  },
  {
    name: 'version',
    type: 'radio-group',
    defaultValue: 3,
    tip: true,
    options: [
      { value: 3, label: 'v3' },
      { value: 4, label: 'v4' },
    ],
  },
  {
    name: 'volume',
    type: 'text',
    example: '/nfs/nfsvolume/',
    tip: true,
  },
  {
    name: 'connectionPoolSize',
    type: 'number',
    integer: true,
    gte: 0,
    example: 10,
    defaultValue: 10,
    optional: true,
    tip: true,
  },
  {
    name: 'dirCache',
    type: 'checkbox',
    defaultValue: true,
    tip: true,
  },
  {
    name: 'readAhead',
    type: 'number',
    integer: true,
    gte: 0,
    default: 0,
    example: 1048576,
    optional: true,
    tip: true,
  },
  {
    name: 'autoReconnect',
    type: 'number',
    integer: true,
    gte: 0,
    default: 1,
    example: 3,
    optional: true,
    tip: true,
  },
];
