export default {
  tabs: {
    overview: {
      title: 'Overview',
      hints: {
        enabled: 'Show basic information and support of the space',
      },
    },
    sync: {
      title: 'Storage import',
      hints: {
        enabled: 'Show statistics of storage import for this space',
        disabled: 'This space has storage import disabled. These settings can only be changed when granting support, and only if the assigned storage is marked as "imported storage".',
      },
    },
    popular: {
      title: 'File popularity',
      hints: {
        enabled: 'Configure file popularity feature for this space',
        // popular tab is never in disabled state
      },
    },
    clean: {
      title: 'Auto-cleaning',
      hints: {
        enabled: 'Configure, show status and reports of auto-cleaning feature for this space',
        disabled: 'Auto-cleaning can be configured only if file popularity feature is enabled',
      },
    },
  },
};
