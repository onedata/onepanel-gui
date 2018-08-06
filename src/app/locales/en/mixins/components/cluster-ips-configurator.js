export default {
  setupAction: 'configuring cluster IP adresses',
  infoExplain: {
    zone: 'Onezone uses a built-in DNS server to ensure the best performance and enable features such as Subdomain Delegation for providers. It is strongly recommended to properly configure external IP address of each node hosting a Cluster Worker Service. Otherwise, the DNS server will not function correctly.',
    provider: 'Oneprovider application needs to be aware of external IP address of each node hosting a Cluster Worker Service. This is required for inter-provider communication.',
  },
  infoSubdomain: 'Since you have enabled Subdomain Delegation, these IP ' +
    'addresses will be passed to Onezone and advertised in its DNS server. ' +
    'This way your clients can reach your Oneprovider service using the ' +
    'selected subdomain without further DNS configuration on your side.',
  configurationInvalid: 'Configuration is invalid or incomplete',
};
