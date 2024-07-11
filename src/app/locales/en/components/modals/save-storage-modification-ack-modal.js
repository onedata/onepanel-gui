export default {
  header: 'Modify storage backend',
  warningsIntro: 'Before proceeding, double-check the updated configuration.',
  warnings: {
    qos: '<strong>Note:</strong> modification of QoS parameters <strong>will not trigger recalculation</strong> of the existing QoS requirements assigned to user files in the supported spaces. Only newly created requirements will use the new parameters. This behaviour will be improved in future releases of Onedata.',
  },
  ackMessage: 'I understand that an incorrect storage backend configuration can cause data loss, corruption, or discrepancies between file metadata and content in all supported spaces.',
  buttons: {
    cancel: 'Cancel',
    proceed: 'Proceed',
  },
};
