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
        tip: 'MonitorTip',
      },
    },
  },
  osdForm: {
    objectStorageDaemon: 'Object Storage Daemon (OSD)',
    removeOsd: 'Remove OSD',
    fields: {
      type: {
        label: 'Type',
        tip: 'typeType',
        options: {
          blockdevice: 'Block device',
          loopdevice: 'Loop device',
        },
      },
      device: {
        label: 'Device',
        tip: 'DeviceTip',
      },
      path: {
        label: 'Path',
        tip: 'pathTip',
      },
      size: {
        label: 'Size',
        tip: 'sizeTip',
      },
    },
    deviceAlreadyUsed: 'Device used by another OSD',
  },
  atLeastManagerMonitor: 'At least one node must provide Manager & Monitor services.',
  atLeastOsd: 'At least one node must provide an Object Storage Daemon.',
};
