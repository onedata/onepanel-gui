import letsEncrypt from './-lets-encrypt';

export default {
  provider: 'Provider',
  deregisterProvider: 'Deregister provider',
  providerDataModification: 'provider data modification',
  providerDeregistration: 'provider deregistration',
  modifySuccess: 'Provider data has been modified',
  deregisterSuccess: 'Provider has been deregistered',
  globalActionsTitle: 'Provider configuration',
  formTitles: {
    show: 'Registered to',
    edit: 'Modify registered provider details',
    new: 'Provider registration',
  },
  formDescriptions: {
    show: 'This provider was registered with following data',
    edit: 'You can update registered provider details and submit the changes in ' +
      'form below',
    new: 'The provider is currently not registered in any Onezone. Please enter ' +
      'details of provider for registration.',
  },
  letsEncrypt,
};
