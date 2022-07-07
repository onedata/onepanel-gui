import statusBadge from './space-support-accounting-form/status-badge';

export default {
  statusBadge,
  fields: {
    accountingEnabled: {
      label: 'Accounting',
      tip: 'If enabled, statistics of quota usage over time will be collected for this space. Accounting relies on the directory statistics service and requires that they are enabled together.',
    },
    dirStatsServiceEnabled: {
      label: 'Directory statistics',
      tip: 'If enabled, directory statistics will be collected for each directory in this space. They include metrics with file count, logical/physical byte size and track their changes in time.',
      disabledDueToAccountingTip: 'Directory statistics are required for accounting and cannot be disabled independently.',
    },
  },
};
