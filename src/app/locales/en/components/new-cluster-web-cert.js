import letsEncrypt from './-lets-encrypt';
import { oneproviderCertInfo, certDocsLink } from './-certificates';

export default {
  header: 'Web certificate',
  letsEncryptToggle: 'Use Let\'s Encrypt',
  certificateGeneration: 'certificate setup',
  generationSuccess: 'The certificate has been obtained and installed successfully',
  redirectInfo: 'When the new certificate has been installed, the page will be reloaded with the new domain.',
  manualWarning: 'You will have to manually obtain and set up proper TLS certificates, instructions can be found here:',
  certDocsLink,
  text: {
    intro: {
      oneprovider: oneproviderCertInfo,
      onezone: 'Every Onezone instance requires valid, trusted TLS certificates to ensure safety of its providers and users.',
    },
    infoP1: 'Certificates can be automatically obtained from the Let\'s Encrypt service. Otherwise, you have to manually obtain and set up proper certificates.',
    infoP21: 'By using the Let\'s Encrypt service you are agreeing to the current Let\'s Encrypt Subscriber Agreement ',
    infoP22: 'The e-mail address you provided will be sent to Let\'s Encrypt.',
  },
  btnLabel: {
    skip: 'Skip obtaining certificate',
    generate: 'Obtain certificate',
  },
  letsEncrypt,
};
