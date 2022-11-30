import storageImport from './-space/storage-import';

export default {
  storageImport,
  storageImportSection: 'Storage import',
  startAccountingEdition: 'Modify',
  cancelAccountingEdition: 'Cancel',
  saveNewAccountingConfig: 'Save',
  id: 'Id',
  name: 'Name',
  storage: 'Assigned storage',
  supportSizeThis: {
    spaceSupportOnThisProvider: 'Space support on this provider',
    modifyingSpaceSupportSize: 'modifying space support size',
    spaceSupportOnThisProviderTip: 'The bar shows provider storage usage for this space. If you are currently modifying the size, it will show expected storage state after resize.',
    editSupportSizeValidation: {
      empty: 'New support size should be a positive number',
    },
    size: 'Size',
    errorSizeLesserThanOccupancy: 'New support size must be greater than space occupied',
  },
  supportInfo: {
    supportingProvidersDataError: 'supportingProviders data is invalid',
    providersSupport: 'Providers support',
    chartTip: 'The chart shows how many space particular providers ' +
      'provide for this space',
    tableTip: 'The table shows how many space particular providers ' +
      'provide for this space',
    provider: 'Provider',
  },
  modal: {
    disable: {
      header: 'Disable directory statistics',
      question: 'Are you sure you want to disable directory statistics? <strong>All collected information will be lost</strong> and it will no longer be possible to view directory sizes or distribution.',
      description: 'In case of subsequent re-enabling of the statistics, the whole space will need to be scanned, which may take a long time depending on its size.',
      buttonConfirm: 'Disable',
    },
    enable: {
      header: 'Enable directory statistics',
      question: 'Are you sure you want to enable directory statistics?',
      description: 'The whole space will be scanned, which will cause additional load on the provider and may take a long time depending on the space size.',
      buttonConfirm: 'Enable',
    },
  },
};
