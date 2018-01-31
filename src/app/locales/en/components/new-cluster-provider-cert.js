import letsEncrypt from './-lets-encrypt';
import { oneproviderCertInfo } from './-certificates';

export default {
  header: 'Provider certificate',
  letsEncryptToggle: 'Use Let\'s Encrypt',
  certificateGeneration: 'certificate setup',
  modifyProvider: 'provider configuration',
  generationSuccess: 'The certificate has been obtained and installed successfully',
  redirectInfo: 'When the new certificate has been installed, you will be redirected to the new oneprovider domain.',
  text: {
    subdomainP1: oneproviderCertInfo +
      'Certificates can be automatically obtained from the Let\'s Encrypt service. ' +
      'Otherwise, you have to manually obtain and set up proper certificates.',
    subdomainP21: 'By using the Let\'s Encrypt service you are agreeing to the current ' +
      'Let\'s Encrypt Subscriber Agreement ',
    subdomainP22: 'The e-mail address you provided will be sent to Let\'s Encrypt.',
    noSubdomain: oneproviderCertInfo +
      'As you have opted to set up your own domain for this provider, ' +
      'you have to manually obtain and set up proper certificates.',
  },
  btnLabel: {
    skip: 'Skip obtaining certificate',
    generate: 'Obtain certificate',
    continue: 'Continue deployment',
  },
  letsEncrypt,
};
