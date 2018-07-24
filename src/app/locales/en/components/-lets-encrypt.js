const authorizationErrorInfoP1 = 'Failed to authorize the domain in Let\'s Encrypt. ' +
  'Ensure that your Oneprovider is reachable under';
const authorizationErrorInfoP2 =
  'and contact your Onezone administrator in case of further problems.';

export default {
  authorizationErrorInfoP1,
  authorizationErrorInfoP2,
  authorizationErrorInfo: `${authorizationErrorInfoP1} configured ` +
    `Oneprovider domain ${authorizationErrorInfoP2}`,
  limitErrorInfo: 'We are sorry, but certificate generation limit has been ' +
    'reached for the domain of your chosen Onezone. This means that currently ' +
    'you cannot obtain a certificate for your subdomain via Let\'s Encrypt. ' +
    'Please try again in some time or obtain a certificate manually.',
};
