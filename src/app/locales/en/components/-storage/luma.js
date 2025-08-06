export default {
  lumaFeedUrl: {
    label: 'External LUMA feed URL',
    tip: 'URL of external feed for LUMA DB, must be reachable from all Oneprovider nodes.',
    placeholder: 'Example: http://localhost:9090',
  },
  lumaFeedApiKey: {
    label: 'External LUMA feed API key',
    tip: 'Optional, arbitrary alphanumeric string that serves as authorization in requests to external feed for LUMA DB. If not specified, no authorization headers will be sent.',
    regexMessage: 'This field can contain only lowercase alphanumeric characters and _',
  },
};
