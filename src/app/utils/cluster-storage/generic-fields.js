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
    name: 'importedStorage',
    type: 'checkbox',
    defaultValue: false,
    tip: true,
  },
  { name: 'lumaEnabled', type: 'checkbox', tip: true, defaultValue: false },
];
