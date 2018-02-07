export default {
  latencyMin: {
    name: 'Min. latency [ms]',
    tip: 'Minimum latency in milliseconds, which should be simulated for '
      + 'selected operations.',
  },
  latencyMax: {
    name: 'Max. latency [ms]',
    tip: 'Maximum latency in milliseconds, which should be simulated for '
      + 'selected operations.',
  },
  timeoutProbability: {
    name: 'Timeout probability',
    tip: 'Probability (0.0, 1.0), with which an operation should return '
      + 'a timeout error.',
  },
  filter: {
    name: 'Filter',
    tip: 'Comma-separated list of filesystem operations, for which latency '
      + 'and timeout should be simulated. Empty or \'*\' mean all operations '
      + 'will be affected.',
  },
  timeout: {
    name: 'Timeout [ms]',
    tip: '',
  },
  insecure: { name: 'Insecure' },
  readonly: { name: 'Read only' },
};
