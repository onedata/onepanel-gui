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
  syncDone: 'Synchronization done, live statistics disabled',
  cancelSyncConfig: 'Cancel sync. configuration',
  syncConfig: 'Configure data synchronization',
  revokeSpaceSupport: 'Revoke space support',
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
