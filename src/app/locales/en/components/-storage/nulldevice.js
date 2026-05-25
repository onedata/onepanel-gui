const simulatedLockHint = 'Supported only if storage import is enabled.';

export default {
  latencyMin: {
    label: 'Min. simulated latency [ms]',
    tip: 'Minimum latency in milliseconds, which should be simulated for ' +
      'selected operations.',
  },
  latencyMax: {
    label: 'Max. simulated latency [ms]',
    tip: 'Maximum latency in milliseconds, which should be simulated for ' +
      'selected operations.',
  },
  timeoutProbability: {
    label: 'Timeout probability',
    tip: 'Probability (0.0, 1.0), with which an operation should return ' +
      'a timeout error.',
  },
  filter: {
    label: 'Filter',
    tip: 'Comma-separated list of filesystem operations, for which latency ' +
      'and timeout should be simulated. Empty or \'*\' mean all operations ' +
      'will be affected.',
  },
  simulatedFilesystemParameters: {
    label: 'Simulated filesystem parameters',
    tip: '<p>Allows simulating a preexisting file/directory tree structure for a null device filesystem.</p><p>For example, "2-3:4-5:512" will generate a filesystem tree which has 2 directories and 3 files in the root of the filesystem. Each of these directories will have 4 subdirectories and 5 files. Suffix ":512" (which is optional) will specify the size of generated files to 512 bytes.</p>The default empty string disables the simulated filesystem feature.',
    regexMessage: 'This field should be in format described in the hint',
    lockHint: simulatedLockHint,
  },
  simulatedFilesystemGrowSpeed: {
    label: 'Simulated filesystem grow speed',
    tip: 'Determines the simulated filesystem grow rate. Default 0.0 value will ' +
      'cause all the files and directories defined by the simulated filesystem parameters ' +
      'specification to be visible immediately. For example value of 0.01 will ' +
      'increase the number of the visible filesystem entries by 1 file per 100 seconds, ' +
      'while 100.0 will increase it by 100 files per second.',
    lockHint: simulatedLockHint,
  },
};
