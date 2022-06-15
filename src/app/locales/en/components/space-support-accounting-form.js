export default {
  fields: {
    accountingEnabled: {
      label: 'Accounting enabled',
      tip: 'Accounting tip',
    },
    dirStatsEnabled: {
      label: 'Gather directory statistics',
      tip: 'Dir stats tip',
      disabledDueToAccountingTip: 'Gathering directory statistics must be turned on when accounting is enabled.',
    },
  },
};
