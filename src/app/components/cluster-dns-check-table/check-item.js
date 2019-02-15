/**
 * Information about single DNS check
 * 
 * @module components/cluster-dns-check-table/check-item
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { dasherize, camelize } from '@ember/string';
import assertProperty from 'onedata-gui-common/utils/assert-property';

/**
 * Messages for these states will be rendered from partials:
 * `components/cluster-dns-check-table/messages/<path>`
 */
const knownPartials = new Set([
  'own-domain/domain/unresolvable',
  'own-domain/domain/missing-records',
  'own-domain/domain/bad-records',
  'own-domain/dns-zone/unresolvable',
  'own-domain/dns-zone/bad-records',
]);

export default Component.extend(I18n, {
  classNames: 'check-item',
  classNameBindings: ['checkPropertyClass'],

  i18n: service(),

  i18nPrefix: 'components.clusterDnsCheckTable.checkItem',

  /**
   * @virtual
   * @type {onepanel.DnsCheck}
   */
  dnsCheckResult: undefined,

  /**
   * @virtual
   * @type {string}
   * One of: onezone, oneprovider
   */
  onepanelServiceType: undefined,

  /**
   * @virtual
   * @type {string}
   */
  domain: undefined,

  /**
   * @virtual
   * @type {string}
   */
  providerOnezoneDomain: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  subdomainDelegation: undefined,

  /**
   * If true, details od check should be displayed (ia. IP addresses)
   * @type {boolean}
   */
  showDetails: false,

  /**
   * @type {string}
   * One of: domain, dnsZone
   */
  checkProperty: reads('dnsCheckResult.type'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  summary: reads('dnsCheckResult.summary'),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  expectedIps: reads('dnsCheckResult.expected'),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  gotIps: reads('dnsCheckResult.got'),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  recommendedDnsRecords: reads('dnsCheckResult.recommended'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  success: equal('summary', 'ok'),

  /**
   * Text to display in recommended DNS records textarea
   * @type {Ember.ComputedProperty<string>}
   */
  recommendedDnsRecordsText: computed(
    'recommendedDnsRecords.[]',
    function recommendedDnsRecordsText() {
      const recommendedDnsRecords = this.get('recommendedDnsRecords') || [];
      return recommendedDnsRecords.join('\n');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  checkPropertyClass: computed('checkProperty', function checkPropertyClass() {
    return `check-${dasherize(this.get('checkProperty'))}`;
  }),

  /**
   * The array contains IPs that were not expected
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  additionalIps: computed(
    'expectedIps.[]',
    'gotIps.[]',
    function additionalIps() {
      const {
        expectedIps,
        gotIps,
      } = this.getProperties('expectedIps', 'gotIps');
      return _.difference(gotIps, expectedIps);
    }
  ),

  /**
   * The array contains IPs that are missing from expected
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  missingIps: computed(
    'expectedIps.[]',
    'gotIps.[]',
    function additionalIps() {
      const {
        expectedIps,
        gotIps,
      } = this.getProperties('expectedIps', 'gotIps');
      return _.difference(expectedIps, gotIps);
    }
  ),

  /**
   * One of: subdomain, ownDomain
   * @type {Ember.ComputedProperty<string>}
   */
  descriptionType: computed(
    'onepanelServiceType',
    'subdomainDelegation',
    function descriptionType() {
      const {
        onepanelServiceType,
        subdomainDelegation,
      } = this.getProperties(
        'onepanelServiceType',
        'subdomainDelegation',
      );
      return onepanelServiceType === 'onezone' || !subdomainDelegation ?
        'ownDomain' : 'subdomain';
    }
  ),

  /**
   * A base to build translation path or partial path for describing DNS
   * check summary
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  summaryPath: computed(
    'descriptionType',
    'checkProperty',
    'summary',
    function summaryPath() {
      const {
        descriptionType,
        checkProperty,
        summary,
      } = this.getProperties('descriptionType', 'checkProperty', 'summary');
      return [descriptionType, checkProperty, summary];
    }
  ),

  /**
   * A locale path to describe DNS check summary
   * @type {Ember.ComputedProperty<string>}
   */
  summaryPathLocale: computed('summaryPath', function summaryPathLocale() {
    return this.get('summaryPath').map(s => camelize(s || '')).join('.');
  }),

  /**
   * A path to partial which describes DNS check summary
   * @type {Ember.ComputedProperty<string>}
   */
  summaryPathPartial: computed('summaryPath', function summaryPartialPath() {
    return this.get('summaryPath').map(s => dasherize(s || '')).join('/');
  }),

  /**
   * True if a partial should be used instead of bare translation for describing
   * DNS check summary
   * @type {Ember.ComputedProperty<boolean>}
   */
  isUsingPartial: computed('summaryPathPartial', function isUsingPartial() {
    return knownPartials.has(this.get('summaryPathPartial'));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  descriptionText: computed(
    'domain',
    'providerOnezoneDomain',
    'summaryPathLocale',
    function descriptionText() {
      return this.t(
        `summaryText.${this.get('summaryPathLocale')}`,
        this.getProperties('domain', 'providerOnezoneDomain')
      );
    }
  ),

  init() {
    this._super(...arguments);
    assertProperty(this, 'dnsCheckResult');
    assertProperty(this, 'onepanelServiceType');
    this.set('showDetails', !this.get('success'));
  },

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
  },
});
