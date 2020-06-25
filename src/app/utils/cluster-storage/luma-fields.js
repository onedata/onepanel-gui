export default [{
    name: 'lumaFeedUrl',
    type: 'text',
    example: 'http://localhost:9090',
    tip: true,
  },
  {
    name: 'lumaFeedApiKey',
    type: 'text',
    regex: /^[a-z0-9_]+$/,
    regexAllowBlank: true,
    optional: true,
    regexMessage: 'This field can contain only lowercase alphanumeric characters and _',
    tip: true,
  },
];
