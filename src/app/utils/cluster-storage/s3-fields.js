const posixRegexp = /^[0-7][0-7][0-7][0-7]?$/;

export default [{
    name: 'accessKey',
    type: 'text',
  },
  {
    name: 'secretKey',
    type: 'password',
  },
  {
    name: 'hostname',
    type: 'text',
    defaultValue: 's3.amazonaws.com',
  },
  {
    name: 'bucketName',
    type: 'text',
  },
  {
    name: 'blockSize',
    type: 'number',
    optional: true,
    tip: true,
    example: '10485760',
    notEditable: true,
  },
  {
    name: 'maximumCanonicalObjectSize',
    type: 'number',
    optional: true,
    tip: true,
    example: '67108864',
    gte: 0,
  },
  {
    name: 'fileMode',
    tip: true,
    type: 'text',
    regex: posixRegexp,
    regexMessage: 'This field should be octal POSIX permissions',
    example: '0664',
    optional: true,
    regexAllowBlank: true,
  },
  {
    name: 'dirMode',
    tip: true,
    type: 'text',
    regex: posixRegexp,
    regexMessage: 'This field should be octal POSIX permissions',
    example: '0775',
    optional: true,
    regexAllowBlank: true,
  },
  {
    name: 'timeout',
    type: 'number',
    optional: true,
  },
];
