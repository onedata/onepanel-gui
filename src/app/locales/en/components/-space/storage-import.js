export default {
  mode: {
    mode: {
      name: 'Mode',
      tip: 'When "auto" mode is selected, the storage will be automatically scanned and data will be imported from storage into the assigned Onedata space without need for copying the data. In case of "manual" mode, the files must be registered manually by the space users with REST API. Registration of directories is not supported.',
      options: {
        auto: 'auto',
        manual: 'manual',
      },
    },
  },
  generic: {
    maxDepth: {
      name: 'Max depth',
      tip: 'Maximum depth of filesystem tree that will be traversed during storage import. By default it is unlimited.',
    },
    syncAcl: {
      name: 'Synchronize ACL',
      tip: 'Enables import of NFSv4 ACLs.',
    },
    continuousScan: {
      name: 'Continuous scan',
      tip: 'Indicates if the data on the storage should be imported into the space periodically. Only continuous import guarantees data integrity if direct modifications on the storage are to be made during the space lifecycle.',
    },
  },
  continuous: {
    scanInterval: {
      name: 'Scan interval [s]',
      tip: 'Period between subsequent scans in seconds (counted from end of one scan till beginning of the following).',
    },
    detectModifications: {
      name: 'Detect modifications',
      tip: 'Flag determining that modifications of files on the synchronized storage will be detected. If disabled, the storage will be treated as immutable (only creations and deletions of files on storage will be detected).',
    },
    detectDeletions: {
      name: 'Detect deletions',
      tip: 'Flag determining that deletions of files will be detected.',
    },
  },
};
