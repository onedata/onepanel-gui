const importedStorageEnabledTip =
  'Indicates that the existing data on this storage is intended for import. Actual data import will happen when the storage is used to support a space. Only one space can be supported by such storage.';

export default {
  name: { name: 'Storage name' },
  storagePathType: {
    name: 'Storage path type',
    tip: 'Determines the type of file path mapping on this storage. Flat paths ' +
      'are based solely on unique identifiers internal to Onedata and do not ' +
      'require modification for rename operations, canonical paths resemble ' +
      'POSIX-style directory structure reflecting the logical space directory tree.',
  },
  skipStorageDetection: {
    name: 'Skip storage detection',
    tip: 'If enabled, detecting whether storage is directly accessible by the Oneclient will not be performed. This option should be enabled on readonly storages.',
  },
  importedStorage: {
    name: 'Imported storage',
    tip: {
      enabled: importedStorageEnabledTip,
      disabled: 'Choosen storage type does not support data import.',
      hasSupport: `${importedStorageEnabledTip} <strong>This option is editable only for storages which do not support any space.</strong>`,
    },
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
