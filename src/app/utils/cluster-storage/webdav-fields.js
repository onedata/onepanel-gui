const posixRegexp = /^[0-7][0-7][0-7][0-7]?$/;

export default [{
    name: 'endpoint',
    type: 'text',
    tip: true,
    regex: /^https?:\/\/.*/,
    regexMessage: 'This field should be an URL with http or https scheme',
    example: 'https://192.168.1.2:8080/webdav',
  },
  {
    name: 'verifyServerCertificate',
    type: 'checkbox',
    defaultValue: true,
    tip: true,
  },
  {
    name: 'credentialsType',
    type: 'radio-group',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'none' },
      { value: 'basic', label: 'basic' },
      { value: 'token', label: 'token' },
      { value: 'oauth2', label: 'OAuth2' },
    ],
    tip: true,
  },
  {
    name: 'credentials',
    type: 'text',
    tip: true,
    optional: true,
  },
  {
    name: 'oauth2IdP',
    type: 'text',
    tip: true,
    optional: true,
    notEditable: true,
  },
  {
    name: 'onedataAccessToken',
    type: 'text',
    tip: true,
    optional: true,
    notEditable: true,
  },
  {
    name: 'authorizationHeader',
    type: 'text',
    tip: true,
    optional: true,
    example: 'Authorization: Bearer <token>',
  },
  {
    name: 'rangeWriteSupport',
    type: 'radio-group',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'none' },
      { value: 'sabredav', label: 'SabreDAV' },
      { value: 'moddav', label: 'ModDAV' },
    ],
    tip: true,
  },
  {
    name: 'connectionPoolSize',
    type: 'number',
    optional: true,
    gte: 0,
    tip: true,
    example: 25,
  },
  {
    name: 'maximumUploadSize',
    type: 'number',
    optional: true,
    gte: 0,
    tip: true,
    example: 1048576,
  },
  {
    name: 'fileMode',
    tip: true,
    type: 'text',
    regex: posixRegexp,
    regexMessage: 'This field should be octal POSIX permissions',
    example: '0644',
    optional: true,
    regexAllowBlank: true,
    notEditable: true,
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
    notEditable: true,
  },
  {
    name: 'timeout',
    type: 'number',
    optional: true,
  },
  {
    name: 'insecure',
    type: 'checkbox',
    defaultValue: false,
    tip: true,
  },
  {
    name: 'readonly',
    type: 'checkbox',
    defaultValue: false,
  },
];
