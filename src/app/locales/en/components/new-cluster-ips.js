export default {
  setupIpsButton: 'Setup IP adresses',
  dnsSetup: 'IP addresses setup',
  clusterHosts: 'Cluster hosts',
  configurationInvalid: 'Configuration is invalid or incomplete',
  // FIXME: generic translations for new and edit
  generalInfo1: 'Oneprovider application needs to be aware of external IP adresses of each node hosting a Cluster Worker or RTransfer Service. This is required for inter-provider communication.',
  withSubdomainInfo: 'Since you have enabled subdomain delegation, these IP addresses will be passed to Onezone and advertised in its DNS server. This way your clients can reach your Oneprovider service using the selected subdomain without further DNS configuration on your side.',
  generalInfo2: 'Below IP adresses are auto-detected suggestions that need to be revised. Please make sure that your cluster nodes are reachable at selected IP addresses or modify them accordingly.',
};
