import letsEncrypt from './-lets-encrypt';

const existingRegistrationDescription =
  'This provider is registered in Onezone with the following data:';

const existingRegistrationRegisteredTo = 'Registered to';

export default {
  provider: 'Provider',
  deregisterProvider: 'Deregister provider',
  providerDataModification: 'provider data modification',
  providerDeregistration: 'provider deregistration',
  modifySuccess: 'Provider data has been modified',
  deregisterSuccess: 'Provider has been deregistered',
  globalActionsTitle: 'Provider configuration',
  formTitles: {
    show: existingRegistrationRegisteredTo,
    edit: existingRegistrationRegisteredTo,
    new: 'Provider registration',
  },
  formDescriptions: {
    show: existingRegistrationDescription,
    edit: existingRegistrationDescription,
    new: 'The provider is currently not registered in any Onezone. Please enter ' +
      'details of provider for registration.',
  },
  letsEncrypt,
};
