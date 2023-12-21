export default {
  header: 'Modify storage backend',
  warningsIntro: 'Your modification can cause below issues and/or will need additional manual steps:',
  warnings: {
    restart: 'this change will not take effect until <strong>Oneprovider and attached Oneclient instances are restarted</strong>',
    qos: 'modification of QoS parameters <strong>will not trigger recalculation of the existing QoS requirements</strong> attached to your files. This will be improved in the next major release of Onedata',
  },
  warningsEnding: 'Are you sure you want to modify storage backend details? Incorrect configuration can make your data unavailable.',
  buttons: {
    cancel: 'Cancel',
    proceed: 'Proceed',
  },
};
