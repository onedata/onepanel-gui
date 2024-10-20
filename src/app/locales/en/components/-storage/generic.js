export default {
  name: { name: 'Name' },
  storagePathType: {
    name: 'Storage path type',
    tip: 'Determines the type of file path mapping on this storage backend. Flat paths ' +
      'are based solely on unique identifiers internal to Onedata and do not ' +
      'require modification for rename operations, canonical paths resemble ' +
      'POSIX-style directory structure reflecting the logical space directory tree.',
  },
  readonly: {
    name: 'Readonly',
    tip: 'Defines whether the storage backend is readonly. If enabled, Oneprovider will block any operation that writes, modifies or deletes data on the storage backend. Such storage backend can only be used to import data into the space. Mandatory to ensure proper behaviour if the backend storage is actually configured as readonly.',
  },
  importedStorage: {
    name: 'Imported storage',
    tip: 'Indicates that the existing data on this storage backend is intended for import. Actual data import will happen when the storage backend is used to support a space. Only one space can be supported by such storage backend.',
  },
  lumaFeed: {
    name: 'LUMA feed',
    tip: `
      <p class="text-center">Determines the way in which Local User Mapping database (LUMA DB) will be filled.</p>
      <p class="text-left"><strong>auto</strong> ‐ User mappings will be determined by automatic algorithm.</p>
      <p class="text-left"><strong>local</strong> ‐ User mappings should be directly set in LUMA DB by space administrator using REST API.</p>
      <p class="text-left"><strong>external</strong> ‐ External, 3rd party service will be queried for user mappings.</p>
    `,
  },
};
