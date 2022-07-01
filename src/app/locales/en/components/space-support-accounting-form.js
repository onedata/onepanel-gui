import statusBadge from './space-support-accounting-form/status-badge';

export default {
  statusBadge,
  fields: {
    accountingEnabled: {
      label: 'Accounting',
      tip: 'Accounting tip',
    },
    dirStatsEnabled: {
      label: 'Directory size statistics',
      tip: 'Dir stats tip',
      disabledDueToAccountingTip: 'Directory size statistics must be turned on when accounting is enabled.',
    },
  },
};
