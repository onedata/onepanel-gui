import { expect } from 'chai';
import { describe, it } from 'mocha';
import domainMatches from 'onepanel-gui/utils/domain-matches';

describe('Unit | Utility | domain-matches', function () {
  it('matches exact domains', function () {
    expect(domainMatches('example.com', 'example.com')).to.be.true;
  });

  it('does not match other domain', function () {
    expect(domainMatches('example.com', 'other.com')).to.be.false;
  });

  it('matches wildcard domains with subdomain', function () {
    expect(domainMatches('sub.example.com', '*.example.com')).to.be.true;
  });

  it('does not match other domain when wildcard is provided', function () {
    expect(domainMatches('sub.example.com', '*.other.com')).to.be.false;
  });

  it('does not match domain without subdomain when subdomain wildcard is provided', function () {
    expect(domainMatches('example.com', '*.example.com')).to.be.false;
  });

  it('does not match domain with multiple subdomains when subdomain wildcard is provided', function () {
    expect(domainMatches('sub.sub.example.com', '*.example.com')).to.be.false;
  });

  it('does not match domains for top-level wildcards', function () {
    expect(domainMatches('example.com', '*.com')).to.be.false;
  });

  it('does not match multiple-asterisk wildcards', function () {
    expect(domainMatches('czesiek.jeden.example.com', '*.*.example.com')).to.be.false;
  });
});
