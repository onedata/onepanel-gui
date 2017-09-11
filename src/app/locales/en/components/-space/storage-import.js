export default {
  importStrategy: 'Import strategy',
  strategies: {
    no_update: 'Disabled',
    simple_scan: 'Simple scan',
  },
  maxDepth: {
    name: 'Max depth',
    tip: 'Maximum depth of filesystem tree that will be traversed during storage synchronization. By default it is unlimited.',
  },
  syncAcl: {
    name: 'Synchronize ACL',
    tip: 'Enables synchronization of NFSv4 ACLs.',
  },
};
