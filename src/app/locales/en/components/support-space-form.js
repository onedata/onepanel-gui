export default {
  storageSelectPlaceholder: 'Select a storage...',
  storageSelectLoading: 'Loading...',
  storageImported: '(import-enabled)',
  storageImportedAndUsed: '(import-enabled, already in use)',
  fields: {
    token: {
      name: 'Support token',
      tip: 'Globally unique identifier assigned by Onezone',
    },
    size: {
      name: 'Size',
    },
    importEnabled: {
      name: 'Import storage data',
      tipEnabled: 'You have chosen an import-enabled storage. The existing data will be imported into the space.',
      tipDisabled: 'You must support the space with an import-enabled storage to unlock import settings.',
    },
  },
  submitButton: 'Support space',
};
