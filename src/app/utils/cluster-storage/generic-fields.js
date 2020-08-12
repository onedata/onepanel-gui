export default [
  { name: 'name', type: 'text' },
  {
    name: 'storagePathType',
    type: 'radio-group',
    // the defaultValue should be set in each form individually!
    defaultValue: 'flat',
    options: [
      { value: 'flat', label: 'flat' },
      { value: 'canonical', label: 'canonical' },
    ],
    tip: true,
    notEditable: true,
  },
  {
    name: 'skipStorageDetection',
    type: 'checkbox',
    optional: true,
    tip: true,
  },
  {
    name: 'importedStorage',
    type: 'checkbox',
    defaultValue: false,
    tip: true,
  },
  {
    name: 'lumaFeed',
    type: 'radio-group',
    options: [
      { value: 'auto', label: 'auto' },
      { value: 'local', label: 'local' },
      { value: 'external', label: 'external' },
    ],
    tip: true,
    defaultValue: 'auto',
  },
];
