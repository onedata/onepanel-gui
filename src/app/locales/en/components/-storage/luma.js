export default {
  lumaUrl: {
    name: 'LUMA URL',
    tip: 'The URL of your LUMA instance, must be reachable from all ' +
      'Oneprovider nodes.',
  },
  lumaCacheTimeout: {
    name: 'LUMA cache timeout [min]',
    tip: 'Expiration time for LUMA mapping cache (in minutes). Every mapping is ' +
      'cached by Oneprovider for better performance, but this causes a ' +
      'synchronization delay when mapping changes. "0" is no cache - this ' +
      'may cause a serious degradation of file-ops performance, but mapping ' +
      'changes in LUMA will have an instantaneous effect.',
  },
  lumaApiKey: {
    name: 'LUMA API key',
    tip: 'Optional, arbitrary alphanumeric string that serves as authorization ' +
      'in requests to LUMA. If not specified, no authorization headers will ' +
      'be sent.',
  },
};
