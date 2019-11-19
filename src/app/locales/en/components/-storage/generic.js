export default {
  name: { name: 'Storage name' },
  storagePathType: {
    name: 'Storage path type',
    tip: 'Determines the type of file path mapping on this storage. Flat paths ' +
      'are based solely on unique identifiers internal to Onedata and do not ' +
      'require modification for rename operations, canonical paths resemble ' +
      'POSIX-style directory structure reflecting the logical space directory tree.',
  },
  importedStorage: {
    name: 'Imported storage',
    tip: 'Indicates that the existing data on this storage is intended for import. Actual data import will happen when the storage is used to support a space. Only one space can be supported by such storage.',
  },
  lumaEnabled: {
    name: 'LUMA enabled',
    tip: 'LUMA allows to map onedata user credentials into storage credentials' +
      ' and vice versa. If enabled, provided LUMA service will be used to resolve' +
      ' the mappings during operations on storage. If disabled, some random' +
      ' credentials (e.g. uid and gid on POSIX storage) will be generated for' +
      ' every user.',
  },
};
