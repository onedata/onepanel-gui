export default {
  tabs: {
    overview: {
      title: 'Overview',
      hints: {
        enabled: 'Show basic information and support of the space',
      },
    },
    sync: {
      title: 'Storage synchronization',
      hints: {
        enabled: 'Show statistics of synchronization with storage for this space',
        disabled: 'Storage synchronization is not enabled, you can enable it in space options',
      },
    },
    popular: {
      title: 'File-popularity',
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
