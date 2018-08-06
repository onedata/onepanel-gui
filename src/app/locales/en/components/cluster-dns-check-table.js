export default {
  checkItem: {
    summaryText: {
      subdomain: {
        domain: {
          unresolvable: 'The domain could not be resolved. This error will make your service unreachable. Please contact the administrator of your Onezone service ({{providerOnezoneDomain}}).',
          missingRecords: 'Some cluster IPs do not have a corresponding DNS A record. Please contact the administrator of your Onezone service ({{providerOnezoneDomain}}).',
          badRecords: 'Resolved cluster IPs are different than expected. Please contact the administrator of your Onezone service ({{providerOnezoneDomain}}).',
          ok: 'All cluster IPs have corresponding DNS A records.',
        },
      },
      ownDomain: {
        domain: {
          unresolvable: 'The domain could not be resolved. This error will make your service unreachable. Please check the configuration of the DNS server responsible for your domain',
          missingRecords: 'Some cluster IPs do not have a corresponding DNS A record. To ensure proper load balancing, please add the missing records in the DNS server responsible for your domain',
          badRecords1: 'Resolved cluster IPs are different than expected. Please adjust the configuration in the DNS server responsible for your domain',
          badRecords2: 'If you believe that expected cluster IPs are not correct, please go back to the previous step and adjust them accordingly.',
          ok: 'All cluster IPs have corresponding DNS A records.',
          // a special case when using builtInDnsServer, summary is not ok, but dnsZone is ok
          delegationInvalidRecords: 'Although the DNS Zone delegation seems to be working, the cluster IPs (A records) are not resolved correctly. Please make sure that DNS queries are properly routed to the Onezone’s built-in server.',
        },
        dnsZone: {
          unresolvable: 'No nameservers could be resolved for the Onezone domain ({{domain}}). DNS Zone delegation is not configured properly. Please check the configuration of the DNS server responsible for your domain',
          badRecords1: 'Resolved nameserver IPs are different than expected. Please ensure that the SOA and NS records configured in the DNS server responsible for your domain',
          badRecords2: 'point to cluster IPs. If you believe that expected cluster IPs are not correct, please go back to the previous step and adjust them accordingly.',
          ok: 'DNS Zone delegation is properly configured for your domain - it will be managed by Onezone’s built-it DNS server.',
        },
      },
    },
    showDetails: 'Show details...',
    hideDetails: 'Hide details',
    gotIps: 'Got IP adresses',
    expectedIps: 'Expected IP adresses',
    recommendedDnsRecords: 'Recommended DNS records',
  },
};
