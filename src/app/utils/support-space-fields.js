// TODO: translate (i18n should be used, so maybe create function for export)
export default [{
    name: 'token',
    type: 'text',
    tip: 'Globally unique identifier assigned by onezone',
    example: 'MDAxNWxvY...',
  },
  { name: 'size', type: 'number', gt: 0, example: '100' },
  {
    name: 'sizeUnit',
    type: 'radio-group',
    nolabel: true,
    options: [
      { value: 'mib', label: 'MiB', _multiplicator: 1048576 },
      { value: 'gib', label: 'GiB', _multiplicator: 1073741824 },
      { value: 'tib', label: 'TiB', _multiplicator: 1099511627776 },
    ],
  },
  {
    name: 'mountInRoot',
    type: 'checkbox',
    optional: true,
  },
  {
    name: '_importEnabled',
    type: 'checkbox',
    tip: 'Configure import files from storage',
    optional: true,
  },
];
