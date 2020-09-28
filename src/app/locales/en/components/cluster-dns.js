export default {
  documentation: 'DNS setup',
  intro: 'This page is intended to check the DNS configuration of your cluster.',
  onezoneBuiltInServer: {
    header: 'Onezone built-in DNS server',
    useToggleLabel: 'Use built-in DNS server',
    text: 'Recommended option for optimal load balancing. The Onezone’s built-in DNS server will manage your domain, however it requires proper configuration (see below).',
    wrongDomain: 'You need a proper domain to enable the built-in DNS server.',
    togglingBuiltInDnsServer: 'toggling built-in DNS server',
  },
  subdomainDelegation: {
    header: 'Subdomain Delegation',
    useToggleLabel: 'Enable Subdomain Delegation',
    text: 'Subdomain Delegation allows issuing subdomains in your domain for the providers registering in this Onezone service (e.g. provider.{{onezoneDomain}}).',
    wrongDomain: 'You need a proper domain to enable Subdomain Delegation.',
    noBuiltInDnsServer: 'Built-in DNS server must be enabled first.',
    togglingSubdomainDelegation: 'toggling subdomain delegation',
  },
  dnsCheck: {
    header: 'DNS check',
    inputIntro: 'By default Onepanel performs the DNS configuration check by resolving the domain based on the host system settings. If you prefer to configure specific DNS servers to be queried instead, provide their IPs below.',
    ipInputPlaceholder: 'Enter IP addresses…',
    modifyingDnsServers: 'modifying DNS check addresses',
    performCheck: 'Perform check',
    stateHint: 'Configuring the DNS server for your domain depends on your environment. If you have a public domain, check the settings in its administration panel. If you are working in a cloud / virtual environment, contact your administrators to learn how can you modify the DNS server config.',
    stateInfo: {
      providerIp: 'This Oneprovider service is registered using an IP address rather than a domain. No DNS check is applicable.',
      providerSubdomainDelegation: 'This Oneprovider service is using Subdomain Delegation – it was assigned a subdomain, which is managed completely by the Onezone service ({{providerOnezoneDomain}}). A DNS check should be performed to make sure that the Onezone service is properly configured to handle your subdomain.',
      providerNoSubdomainDelegationPreHint: 'This Oneprovider service is registered under domain "{{domain}}". You should ensure that the DNS server responsible for your domain',
      providerNoSubdomainDelegationPostHint: 'is properly configured.',
      zoneIp: 'This Onezone service is registered using an IP address rather than a domain. No DNS check is applicable.',
      zoneSubdomainDelegationPreHint: 'You have enabled Subdomain Delegation. To make sure it works properly, you must set up DNS Zone delegation in the DNS server responsible for your domain ({{domain}})',
      zoneSubdomainDelegationPostHint: '. It will route DNS queries concerning this domain to the built-in DNS server within Onezone service.',
      zoneNoSubdomainDelegationPreHint: 'This Onezone service is registered under domain "{{domain}}". You should ensure that the DNS server responsible for your domain',
      zoneNoSubdomainDelegationPostHint: 'is properly configured. It is strongly recommended that you set up DNS Zone delegation in the DNS server responsible for your domain ({{domain}}). It will route DNS queries concerning this domain to the built-in DNS server within Onezone service.',
    },
    result: {
      header: 'Results',
      checkPerformed: 'last check performed',
    },
    resultsObsoleteHead: 'Some settings have been modified',
    resultsObsoleteText: 'Please perform a new DNS check to make sure your configuration works as expected.',
  },
  dnsServersText: 'Onepanel performs a DNS configuration check using public DNS servers. If your Onezone domain is not visible outside your local network, you can provide the IP address of your local DNS server (if any) to query during the check.',
  dnsServersInputText: 'Type additional DNS IP adresses and hit enter',
  verifyTableHeader: 'DNS configuration status',
  form: {
    subdomainDelegationToggle: {
      label: 'Enable Subdomain Delegation',
      tip: 'If enabled, Oneproviders are allowed to use subdomains of the Onezone domain as their domains.',
    },
  },
  enablingSubdomainDelegation: 'enabling Subdomain Delegation',
  disablingSubdomainDelegation: 'disabling Subdomain Delegation',
  dnsCheckAutodetect: 'Use system defaults',
  dnsCheckManual: 'Specify servers manually',
};
