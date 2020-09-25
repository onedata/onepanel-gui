export default [{
    name: 'token',
    type: 'text',
    tip: true,
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
];
