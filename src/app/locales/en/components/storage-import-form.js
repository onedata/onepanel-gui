import storageImport from './-space/storage-import';

export default {
  fields: storageImport,
  importConfiguration: 'Storage import configuration',
  continuousScanEnabledDesc: 'Continuous scan <strong>enabled</strong> - the storage will be scanned periodically and direct changes on the storage will be reflected in the assigned Onedata space (upon the consecutive scan).',
  continuousScanDisabledDesc: 'Continuous scan <strong>disabled</strong> - the storage will be scanned once and the data will be imported to the assigned Onedata space. You must never modify the data directly on the storage during the space lifecycle or its integrity will be lost.',
  submitNew: 'Start import',
  submitModify: 'Save configuration',
};
