// TODO: translate (i18n should be used, so maybe create function for export)
export default [{
    name: 'token',
    type: 'text',
    tip: 'Globally unique identifier assigned by Onezone',
    example: 'MDAxNWxvY...',
  },
  { name: 'size', type: 'number', gt: 0, example: '100' },
  {
    name: 'sizeUnit',
    type: 'radio-group',
    nolabel: true,
    options: [
      { value: 'mib', label: 'MiB', _multiplicator: Math.pow(1024, 2) },
      { value: 'gib', label: 'GiB', _multiplicator: Math.pow(1024, 3) },
      { value: 'tib', label: 'TiB', _multiplicator: Math.pow(1024, 4) },
      { value: 'pib', label: 'PiB', _multiplicator: Math.pow(1024, 5) },
    ],
  },
  {
    name: '_importEnabled',
    type: 'checkbox',
    tip: 'Configure import files from storage',
    optional: true,
  },
];
