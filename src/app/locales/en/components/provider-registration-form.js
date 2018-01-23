const ONEPROVIDER_CERT_INTRO =
  'Every Oneprovider instance requires valid, trusted TLS certificates ' +
  'to communicate with other providers and ensure safety of its users. ';

export default {
  register: 'Register',
  modifyProviderDetails: 'Modify provider details',
  subdomainReserved: 'This subdomain is reserved.',
  fields: {
    id: {
      label: 'ID',
    },
    name: {
      label: 'Provider name',
    },
    adminEmail: {
      label: 'Admin e-mail',
      tip: 'Provide your e-mail address so that the Onezone admin can reach you. ' +
        'The e-mail will be used only for contact concerning administration ' +
        'of your Oneprovider instance.',
    },
    onezoneDomainName: {
      label: 'Onezone domain',
    },
    subdomainDelegation: {
      label: 'Request a subdomain',
      tip: 'If enabled, this provider will be assigned a subdomain of your ' +
        'choice in Onezone\'s domain. Onezone will automatically handle DNS ' +
        'configuration for this provider. If disabled, you will need to ' +
        'manually configure hostname and DNS entries for this provider.',
    },
    domain: {
      label: 'Domain',
      tip: 'Fully qualified domain name for this provider. Your DNS server ' +
        'must be properly configured to resolve the domain into all provider ' +
        'nodes, otherwise the load will not be distributed between them. You ' +
        'will need a web certificate issued for that domain and signed by a ' +
        'trusted CA to ensure safe connection for users.',
    },
    letsEncryptEnabled: {
      label: 'Use Let\'s Encrypt',
      tip: ONEPROVIDER_CERT_INTRO +
        'Certificates can be automatically obtained from the Let\'s Encrypt service. ' +
        'Otherwise, you have to manually obtain and set up proper certificates.',
    },
    subdomain: {
      label: 'Subdomain',
      tip: 'Subdomain that you are requesting for this provider, unique in the ' +
        'scope of your Onezone. It must be a single word consisting of ' +
        'alphanumeric characters and optional dashes (-).',
    },
    geoLatitude: {
      label: 'Latitude',
    },
    geoLongitude: {
      label: 'Longitude',
    },
  },
};
