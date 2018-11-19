export default {
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
          bluestore: 'BlueStore',
          filestore: 'FileStore',
        },
      },
      device: {
        label: 'Device',
      },
      dbDevice: {
        label: 'Database device',
      },
      path: {
        label: 'Path',
      },
    },
    deviceAlreadyUsed: 'Device used by another OSD',
  },
  atLeastManagerMonitor: 'At least one node must provide Manager & Monitor services.',
  atLeastOsd: 'At least one node must provide an Object Storage Daemon.',
};
