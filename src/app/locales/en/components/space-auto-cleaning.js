export default {
  autoCleaning: 'Auto cleaning',
  cleanReplicatedFiles: 'Clean replicated files',
  cleaningBoundaries: 'Cleaning boundaries',
  statusLoadError: 'Could not load status of space auto cleaning.',
  reportsLoadError: 'Could not load space cleaning reports.',
  headerHint: 'Enable or disable automatic cleaning of replicated files.  ',
  conditionsHint: 'Specify conditions for files that should be cleaned. ' +
    'Only replicated files that meet these conditions will be cleaned.',
  boundariesHint: 'Schedule auto cleaning start and stop based on space usage. ' +
    'The process will start when storage usage exceeds threshold and stop when ' +
    'storage usage will reach the target.',
  reportsHint: 'Each report refers to a single auto cleaning started process',
  startCleaning: 'Start cleaning now',
  startCleaningHint: 'Manually starts cleaning of space with current ' +
    'configuration. Does not check if storage occupancy has exceeded threshold.',
};