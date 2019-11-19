import storageImport from './-space/storage-import';
import storageUpdate from './-space/storage-update';

export default {
  storageImport,
  storageUpdate,
  id: 'Id',
  name: 'Name',
  mountInRoot: 'Mount in root',
  storage: 'This provider storage',
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
};