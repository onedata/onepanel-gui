import statusBadge from './space-support-accounting-form/status-badge';

export default {
  statusBadge,
  fields: {
    accountingEnabled: {
      label: 'Accounting',
      tip: 'If enabled, space usage statistics will be collected to provide information about it\'s current and historical load. In order to work properly it enforces directory size statistics collecting.',
    },
    dirStatsServiceEnabled: {
      label: 'Directory size statistics',
      tip: 'If enabled, directory size statistics will be collected for each directory in this space. They include metrics with file count, logical byte size and physical byte size and track their changes in time.',
      disabledDueToAccountingTip: 'Directory size statistics must be turned on when accounting is enabled.',
    },
  },
};
