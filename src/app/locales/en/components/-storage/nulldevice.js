export default {
  latencyMin: {
    name: 'Min. latency [ms]',
    tip: 'Minimum latency in milliseconds, which should be simulated for ' +
      'selected operations.',
  },
  latencyMax: {
    name: 'Max. latency [ms]',
    tip: 'Maximum latency in milliseconds, which should be simulated for ' +
      'selected operations.',
  },
  timeoutProbability: {
    name: 'Timeout probability',
    tip: 'Probability (0.0, 1.0), with which an operation should return ' +
      'a timeout error.',
  },
  filter: {
    name: 'Filter',
    tip: 'Comma-separated list of filesystem operations, for which latency ' +
      'and timeout should be simulated. Empty or \'*\' mean all operations ' +
      'will be affected.',
  },
  simulatedFilesystemParameters: {
    name: 'Simulated filesystem parameters',
    tip: '<p>Specifies files tree structure for a simulated null device filesystem.</p><p>For example "2-3:4-5:512" will generate a filesystem tree which has 2 directories and 3 files in the root of the filesystem. Each of these directories will have 4 sbdirectories and 5 files. Suffix ":512" (which is optional) will specify the size of generated files to 512 bytes.</p>Default empty string disables the simulated filesystem feature.',
  },
  simulatedFilesystemGrowSpeed: {
    name: 'Simulated filesystem grow speed',
    tip: 'Determines the simulated filesystem grow rate. Default 0.0 value will ' +
      'cause all the files and directories defined by the simulated filesystem parameters ' +
      'specification to be visible immediately. For example value of 0.01 will ' +
      'increase the number of the visible filesystem entries by 1 file per 100 seconds, ' +
      'while 100.0 will increase it by 100 files per second.',
  },
  timeout: { name: 'Timeout [ms]' },
};
