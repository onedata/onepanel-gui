export default [
  { name: 'name', type: 'text' },
  { name: 'lumaEnabled', type: 'checkbox', defaultValue: false,
    tip: 'LUMA allows to map onedata user credentials into storage credentials' +
      ' and vice versa. If enabled, provided LUMA service will be used to resolve' +
      ' the mappings during operations on storage. If disabled, some random' + 
      ' credentials (e.g. uid and gid on POSIX storage) will be generated for' + 
      ' every user.'
  },
  { 
    name: 'lumaUrl', 
    type: 'text', 
    example: 'http://localhost:9090', 
    tip: 'The URL of your LUMA instance, must be reachable from all Oneprovider nodes.'
  }
];
