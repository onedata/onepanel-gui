import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import I18nStub from '../../../helpers/i18n-stub';

describe('Integration | Component | cluster dns check table/check item', function () {
  setupComponentTest('cluster-dns-check-table/check-item', {
    integration: true,
  });

  this.beforeEach(function () {
    this.register('service:i18n', I18nStub);
    this.inject.service('i18n', { as: 'i18n' });
  });

  it('renders warning icon if status is not ok', function () {
    this.set('dnsCheckResult', {
      summary: 'unresolvable',
      expected: [],
      got: [],
      recommended: [],
    });

    this.render(hbs `{{cluster-dns-check-table/check-item 
      dnsCheckResult=dnsCheckResult
      checkProperty="domain"
      onepanelServiceType="provider"
    }}
    `);

    const $checkItem = this.$('.check-item');

    expect($checkItem, 'check item').to.exist;
    const $icon = $checkItem.find('.check-state .one-icon');
    expect($icon, 'icon').to.exist;
    expect($icon).to.have.class('warning');
  });

  it('renders success icon if status is ok', function () {
    this.set('dnsCheckResult', {
      summary: 'ok',
      expected: [],
      got: [],
      recommended: [],
    });

    this.render(hbs `{{cluster-dns-check-table/check-item 
      dnsCheckResult=dnsCheckResult
      checkProperty="domain"
      onepanelServiceType="provider"
    }}
    `);

    const $checkItem = this.$('.check-item');

    expect($checkItem, 'check item').to.exist;
    const $icon = $checkItem.find('.check-state .one-icon');
    expect($icon, 'icon').to.exist;
    expect($icon).to.have.class('success');
  });

  it('does not render additional text when not ok and there are additional ips',
    function () {
      const additionalText = 'some additional text';
      this.set('i18n.translations', {
        components: {
          clusterDnsCheckTable: {
            checkItem: {
              additionalText: {
                domain: additionalText,
              },
            },
          },
        },
      });

      this.set('dnsCheckResult', {
        summary: 'unresolvable',
        expected: ['192.168.0.1'],
        got: ['192.168.0.1', '192.168.0.2'],
        recommended: [],
      });

      this.render(hbs `{{cluster-dns-check-table/check-item 
      dnsCheckResult=dnsCheckResult
      checkProperty="domain"
      onepanelServiceType="provider"
    }}
    `);

      const $checkItem = this.$('.check-item');
      expect($checkItem).to.not.contain(additionalText);
    });

  it('shows list of additional IP adresses', function () {
    const expectedIps = ['127.0.0.1', '127.0.0.2'];
    const additionalIps = ['192.168.0.1', '192.168.0.2'];

    this.set('dnsCheckResult', {
      summary: 'unresolvable',
      expected: [expectedIps],
      got: [...expectedIps, ...additionalIps],
      recommended: [],
    });

    this.render(hbs `{{cluster-dns-check-table/check-item 
      dnsCheckResult=dnsCheckResult
      checkProperty="domain"
      onepanelServiceType="provider"
    }}
    `);

    const $checkItem = this.$('.check-item');

    expect($checkItem, 'check item').to.exist;
    additionalIps.forEach(ip => expect($checkItem).to.contain(ip));
  });

  it('shows list of missing IP adresses', function () {
    const expectedIps = ['127.0.0.1', '127.0.0.2', '192.168.0.1', '192.168.0.2'];
    const gotIps = ['127.0.0.1', '127.0.0.2'];

    this.set('dnsCheckResult', {
      summary: 'unresolvable',
      expected: expectedIps,
      got: gotIps,
      recommended: [],
    });

    this.render(hbs `{{cluster-dns-check-table/check-item 
      dnsCheckResult=dnsCheckResult
      checkProperty="domain"
      onepanelServiceType="provider"
    }}
    `);

    const $checkItem = this.$('.check-item');

    expect($checkItem, 'check item').to.exist;
    ['192.168.0.1', '192.168.0.2'].forEach(ip => expect($checkItem).to.contain(ip));
  });
});
