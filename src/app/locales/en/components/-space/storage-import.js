export default {
  mode: {
    mode: {
      name: 'Mode',
      tip: 'When "auto" mode is selected, the storage will be automatically scanned and data will be imported from storage backend into the assigned Onedata space. In case of "manual" mode, the files must be registered manually by the space users with REST API. Registration of directories is not supported. In both modes there is no need for copying the data.',
      options: {
        auto: 'auto',
        manual: 'manual',
      },
    },
  },
  generic: {
    maxDepth: {
      name: 'Max depth',
      tip: 'Maximum depth of filesystem tree that will be traversed during the scan. By default it is 65535.',
    },
    syncAcl: {
      name: 'Synchronize ACL',
      tip: 'Enables import of NFSv4 ACLs.',
    },
    detectModifications: {
      name: 'Detect modifications',
      tip: 'If disabled, the storage will be treated as immutable – changes of already imported files will not be detected. Relevant only if more than one scan is performed.',
    },
    detectDeletions: {
      name: 'Detect deletions',
      tip: 'Flag determining that deletions of already imported files will be detected and reflected. Relevant only if more than one scan is performed.',
    },
    continuousScan: {
      name: 'Continuous scan',
      tip: 'Indicates if the data on the storage backend should be imported into the space periodically. Continuous import guarantees data integrity if direct modifications on the storage backend are to be made during the space lifecycle.',
    },
  },
  continuous: {
    scanInterval: {
      name: 'Scan interval [s]',
      tip: 'Period between subsequent scans in seconds (counted from end of one scan till beginning of the following).',
    },
  },
};
