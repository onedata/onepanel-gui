const posixRegexp = /^[0-7][0-7][0-7][0-7]?$/;

export default [{
    name: 'url',
    tip: true,
    type: 'text',
    regex: /^(https?|root):\/\/.*/,
    regexMessage: 'This field should be an URL with http, https or root scheme',
    example: 'root://192.168.0.1//data',
  }, {
    name: 'fileModeMask',
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
    name: 'dirModeMask',
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
    name: 'credentialsType',
    type: 'radio-group',
    defaultValue: 'none',
    options: [
      { value: 'none', label: 'none' },
      { value: 'pwd', label: 'password' },
    ],
    tip: true,
  },
  {
    name: 'credentials',
    type: 'text',
    tip: true,
    optional: true,
    example: 'username:password',
  },
  {
    name: 'timeout',
    type: 'number',
    optional: true,
  },
];
