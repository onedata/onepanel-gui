import storageImport from './-space/storage-import';
import storageUpdate from './-space/storage-update';

export default {
  id: 'Id',
  name: 'Name',
  mountInRoot: 'Mount in root',
  storage: 'This provider storage',
  storageImport,
  storageUpdate,
  minute: 'Minute',
  hour: 'Hour',
  day: 'Day',
  syncDone: 'Import done',
  syncDoneHint: 'Synchronization is done, live statistics are disabled',
  cancelSyncConfig: 'Cancel sync. configuration',
  syncConfig: 'Configure data synchronization',
  syncFormHeader: 'Data synchronization configuration',
  revokeSpaceSupport: 'Revoke space support',
  revokeSupportTitle: 'Revoke space support',
  revokeSupportMsg: 'When the support will be revoked, data from the "{{spaceName}}" space that is not replicated among other providers will be lost.',
  revokeSupportCancel: 'No, keep the support',
  revokeSupportProceed: 'Yes, revoke',
  supportInfo: {
    supportingProvidersDataError: 'supportingProviders data is invalid',
    providersSupport: 'Providers support',
    chartTip: 'The chart shows how many space particular providers ' +
      'provide for this space',
    tableTip: 'The table shows how many space particular providers ' +
      'provide for this space',
    provider: 'Provider',
  },
  tabs: {
    sync: {
      title: 'Storage synchronization',
      hints: {
        enabled: 'Show statistics of synchronization with storage for this space',
        disabled: 'Storage synchronization is not enabled, you can enable it in space options',
      },
    },
    popular: {
      title: 'Files popularity',
      hints: {
        enabled: 'Configure files popularity feature for this space',
        // popular tab is never in disabled state
      },
    },
    clean: {
      title: 'Auto cleaning',
      hints: {
        enabled: 'Configure, show status and reports of auto cleaning feature for this space',
        disabled: 'Auto cleaning can be configured only if files popularity feature is enabled',
      },
    },
  },
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
};
