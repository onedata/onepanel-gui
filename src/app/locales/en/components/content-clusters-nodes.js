export default {
  header: 'Nodes of "{{name}}"',
  tabServices: 'Services',
  tabIps: 'Cluster IPs',
  editIps: 'Edit IPs',
  cancelIpsEdit: 'Cancel editing',
  setupIpsButton: 'Confirm changes',
  discardChanges: 'Discard changes',
  cancelEdit: 'Cancel edition',
  editServices: 'Edit services',
  applyChanges: 'Apply',
  editingUnlockedToggles: 'Edit services deployed in the hosts table below and proceed with the <strong>Apply</strong> button. Currently, you can only enable OneS3 services on cluster hosts. Disabling OneS3, toggling other services, and adding or removing hosts are not available in this software release.',
  editDisabledZone: 'Editing Onezone cluster services is not available in this software release.',
  disabledToggleReasons: {
    workerOneS3PortConflict: 'OneS3 services deployed on this cluster use port 443. You cannot enable OneS3 on hosts that have already deployed Cluster Worker, which uses the same port (443).',
  },
};
