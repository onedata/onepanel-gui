export default {
  header: 'Modify storage backend',
  warningsIntro: 'Your modification can cause below issues and/or will need additional manual steps:',
  warnings: {
    restart: 'The changes in storage configuration will not take effect until Oneprovider and attached Oneclient instances are restarted. This behaviour will be improved in future releases of Onedata.',
    qos: 'Modification of QoS parameters <strong>will not trigger recalculation</strong> of the existing QoS requirements assigned to user files in the supported spaces. Only newly created requirements will use the new parameters. This behaviour will be improved in future releases of Onedata.',
  },
  ackMessage: 'I understand that incorrect storage configuration can cause data loss, corruption, or discrepancies between file metadata and content in all supported spaces. ',
  buttons: {
    cancel: 'Cancel',
    proceed: 'Proceed',
  },
};
