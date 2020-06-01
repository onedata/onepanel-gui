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
  lumaFeed: {
    name: 'LUMA feed',
    tip: 'Determines the way in which Local User Mapping database (LUMA DB) will be filled.<br><strong>auto</strong> - User mappings will be determined by automatic algorithm<br><strong>local</strong> - User mappings should be directly set in LUMA DB by space administrator using REST API.<br><strong>external</strong> - External, 3rd party service will be queried for user mappings.',
  },
};
