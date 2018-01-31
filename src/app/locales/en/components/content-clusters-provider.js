import letsEncrypt from './-lets-encrypt';

export default {
  cancelModifying: 'Cancel modifying',
  modifyProviderDetails: 'Modify provider details',
  providerDataModification: 'provider data modification',
  providerDeregistration: 'provider deregistration',
  modifySuccess: 'Provider data has been modified',
  deregisterSuccess: 'Provider has been deregistered',
  formTitles: {
    show: 'Registered provider details',
    edit: 'Modify registered provider details',
    new: 'Provider registration',
  },
  formDescriptions: {
    show: 'This provider was registered with following data',
    edit: 'You can update registered provider details and submit the changes in ' +
      'form below',
    new: 'The provider is currently not registered in any Zone. Please enter ' +
      'details of provider for registration.',
  },
  letsEncrypt,
};
