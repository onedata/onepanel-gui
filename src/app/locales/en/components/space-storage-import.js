import storageImport from './-space/storage-import';

export default {
  storageImport,
  manualImportHeader: 'Manual storage import',
  manualImportDescriptionBeforeApi: 'This space support is configured with <strong>manual import mode</strong> - the files located on the storage must be manually registered to be accessible within the Onedata space. Registration can be performed by the space users with REST API - see the example below or refer to the ',
  manualImportDescriptionApi: 'API documentation',
  manualImportDescriptionAfterApi: '. Please note that registration of directories is not supported.',
  cannotSwitchToAutoModeDescription: 'The storage import mode cannot be changed during the space lifecycle. In order to switch to the <strong>auto import mode</strong>, it is required to support the space with different configuration (and possibly another storage).',
  fileRegistrationExample: 'File registration request example',
  configurationCollapse: 'Auto storage import configuration',
  minute: 'Minute',
  hour: 'Hour',
  day: 'Day',
  importFormHeader: 'Configure auto storage import',
  importDetails: {
    start: 'Started',
    stop: 'Stopped',
    createdFiles: 'Created files',
    modifiedFiles: 'Modified files',
    deletedFiles: 'Deleted files',
  },
  startStopScanButton: {
    stopScan: 'Stop scan',
    startScan: 'Start scan',
  },
};
