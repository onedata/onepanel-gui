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
    managerAndMonitorTip: 'Daemons managing cluster configuration. Odd number of monitor nodes is recommended.',
    addOsd: 'Add OSD',
  },
  managerMonitorForm: {
    fields: {
      monitorIp: {
        label: 'Monitor IP',
        tip: 'IP address of the monitor node in the network connecting Ceph nodes. Must be an address of one of the machine\'s interfaces.',
      },
    },
  },
  osdForm: {
    objectStorageDaemon: 'Object Storage Daemon (OSD)',
    tip: 'Daemon handling data storage. An OSD must be deployed for each device (disk) to be used.',
    removeOsd: 'Remove OSD',
    fields: {
      type: {
        label: 'Type',
        tip: 'OSD can either use a block device (physical disk, partition or LVM logical volume) or create a virtual disk using "loop device" mechanism for setup without a dedicated device.',
        options: {
          blockdevice: 'Block device',
          loopdevice: 'Loop device',
        },
      },
      device: {
        label: 'Device',
        tip: 'Block device to be formatted for use by the OSD. All existing data will be lost when creating the OSD.',
      },
      path: {
        label: 'Path',
        tip: 'Path were the file holding loop device data will be created.',
      },
      size: {
        label: 'Size',
        tip: 'Size of the created loop device.',
      },
    },
    deviceAlreadyUsed: 'Device used by another OSD',
  },
  atLeastManagerMonitor: 'At least one node must provide Manager & Monitor services.',
  atLeastOsd: 'At least one node must provide an Object Storage Daemon.',
};
