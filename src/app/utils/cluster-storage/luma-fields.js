export default [
  {
    name: 'lumaUrl', 
    type: 'text', 
    example: 'http://localhost:9090', 
    tip: 'The URL of your LUMA instance, must be reachable from all Oneprovider nodes.'
  },
  {
    name: 'lumaCacheTimeout',
    type: 'number',
    gte: 0,
    integer: true,
    example: 5,
    defaultValue: 5,
    tip: 'Expiration time for LUMA mapping cache (in minutes). Every mapping is ' +
      'cached by Oneprovider for better performance, but this causes a ' +
      'synchronization delay when mapping changes. "0" is no cache - this ' +
      'may cause a serious degradation of file-ops performance, but mapping ' +
      'changes in LUMA will have an instantaneous effect.'
  },
  {
    name: 'lumaApiKey',
    type: 'text',
    regex: /^[a-z0-9_]+$/,
    regexAllowBlank: true,
    optional: true,
    regexMessage: 'This field can contain only lowercase alphanumeric characters and _',
    tip: 'Optional, arbitrary alphanumeric string that serves as authorization ' +
      'in requests to LUMA. If not specified, no authorization headers will be sent.'
  },
];
