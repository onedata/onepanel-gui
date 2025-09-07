/**
 * Checks if a given domain matches a DNS name or wildcard DNS name.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * Checks if a given domain matches a DNS name or wildcard DNS name.
 *
 * @param {string} domain The domain to check (e.g., "sub.example.com").
 * @param {string} dnsName The DNS name from the certificate (e.g., "*.example.com").
 * @returns {boolean} True if the domain matches the DNS name, false otherwise.
 */
export default function domainMatches(domain, dnsName) {
  if (!domain || !dnsName) {
    throw new Error('domainMatches: both domain and dnsName must be provided');
  }
  if (!dnsName.startsWith('*.')) {
    return domain === dnsName;
  }
  const [, subdomain, domainRest] = domain.match(/(.*?)\.(.*)/) ?? [];
  if (!subdomain || !domainRest) {
    return false;
  }
  const dnsNameRest = dnsName.match(/\*\.(.*)/)[1];
  if (
    // invalid dnsName
    !dnsNameRest ||
    // multiple wildcards used
    dnsNameRest.includes('*.') ||
    // top-level domain used with wildcard
    !dnsNameRest.includes('.')
  ) {
    return false;
  }
  return domainRest === dnsNameRest;
}
