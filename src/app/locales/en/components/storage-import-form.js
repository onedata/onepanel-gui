import storageImport from './-space/storage-import';

export default {
  fields: storageImport,
  importConfiguration: 'Storage import configuration',
  continuousScanEnabledDesc: 'Continuous scan <strong>enabled</strong> - the storage will be scanned periodically and direct changes on the storage will be reflected in the assigned Onedata space (upon the consecutive scan).',
  continuousScanDisabledDesc: 'Continuous scan <strong>disabled</strong> - the storage will be scanned once and the data will be imported to the assigned Onedata space. If the data is modified directly on the storage during the space lifecycle, <strong>its integrity will be lost</strong>. In such case, it is possible to manually start another scan that will detect and integrate the changes.<br/><br/>The options <strong>Detect modifications/deletions</strong> are <strong>ignored during the first scan.</strong>',
  submitNew: 'Start import',
  submitModify: 'Save configuration',
};
