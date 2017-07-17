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
  }
];
