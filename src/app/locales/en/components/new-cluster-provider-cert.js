const ONEPROVIDER_CERT_INTRO =
  'Every Oneprovider instance requires valid, trusted TLS certificates ' +
  'to communicate with other providers and ensure safety of its users. ';

const AUTHORIZATION_ERROR_INFO_P1 = 'Failed to authorize the domain in Let\'s Encrypt. ' +
  'Ensure that your Oneprovider is reachable under';
const AUTHORIZATION_ERROR_INFO_P2 =
  'and contact your onezone administrator in case of further problems.';

export default {
  header: 'Provider certificate',
  letsEncryptToggle: 'Use Let\'s Encrypt',
  certificateGeneration: 'certificate setup',
  modifyProvider: 'provider configuration',
  generationSuccess: 'The certificate has been obtained and installed successfully',
  redirectInfo: 'When the new certificate has been installed, you will be redirected to the new oneprovider domain.',
  limitErrorInfo: 'We are sorry, but certificate generation limit has been ' +
    'reached for the domain of your chosen Onezone. This means that currently ' +
    'you cannot obtain a certificate for your subdomain via Let\'s Encrypt. ' +
    'Please try again in some time or obtain a certificate manually.',
  authorizationErrorInfoP1: AUTHORIZATION_ERROR_INFO_P1,
  authorizationErrorInfoP2: AUTHORIZATION_ERROR_INFO_P2,
  authorizationErrorInfo: `${AUTHORIZATION_ERROR_INFO_P1} configured ` +
    `Oneprovider domain ${AUTHORIZATION_ERROR_INFO_P2}`,
  text: {
    subdomainP1: ONEPROVIDER_CERT_INTRO +
      'Certificates can be automatically obtained from the Let\'s Encrypt service. ' +
      'Otherwise, you have to manually obtain and set up proper certificates.',
    subdomainP21: 'By using the Let\'s Encrypt service you are agreeing to the current ' +
      'Let\'s Encrypt Subscriber Agreement ',
    subdomainP22: 'The e-mail address you provided will be sent to Let\'s Encrypt.',
    noSubdomain: ONEPROVIDER_CERT_INTRO +
      'As you have opted to set up your own domain for this provider, ' +
      'you have to manually obtain and set up proper certificates.',
  },
  btnLabel: {
    skip: 'Skip obtaining certificate',
    generate: 'Obtain certificate',
    continue: 'Continue deployment',
  },
};
