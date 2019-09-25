export default {
  globalParameters: 'Global parameters',
  nodes: 'Nodes',
  mainOptionsForm: {
    fields: {
      name: {
        label: 'Cluster name',
      },
    },
  },
  node: {
    managerAndMonitor: 'Manager & Monitor',
    addOsd: 'Add OSD',
  },
  managerMonitorForm: {
    fields: {
      monitorIp: {
        label: 'Monitor IP',
      },
    },
  },
  osdForm: {
    objectStorageDaemon: 'Object Storage Daemon (OSD)',
    fields: {
      type: {
        label: 'Type',
        options: {
          blockdevice: 'Block device',
          loopdevice: 'Loop device',
        },
      },
      device: {
        label: 'Device',
      },
      path: {
        label: 'Path',
      },
      size: {
        label: 'Size',
      },
    },
    deviceAlreadyUsed: 'Device used by another OSD',
  },
  atLeastManagerMonitor: 'At least one node must provide Manager & Monitor services.',
  atLeastOsd: 'At least one node must provide an Object Storage Daemon.',
};
