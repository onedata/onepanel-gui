export default {
  setupAction: 'configuring cluster IP adresses',
  infoExplain: '{{serviceName}} application needs to be aware of external IP ' +
    'address of each node hosting a Cluster Worker or RTransfer Service. ' +
    'This is required for inter-provider communication.',
  infoSubdomain: 'Since you have enabled subdomain delegation, these IP ' +
    'addresses will be passed to Onezone and advertised in its DNS server. ' +
    'This way your clients can reach your Oneprovider service using the ' +
    'selected subdomain without further DNS configuration on your side.',
  configurationInvalid: 'Configuration is invalid or incomplete',
};
