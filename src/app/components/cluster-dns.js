/**
 * View for configuring built-in DNS server, subdomain delegation and perform
 * DNS checks both for deployment and as cluster aspect.
 * 
 * @module components/cluster-dns
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import DomainNameProxy from 'onepanel-gui/mixins/domain-name-proxy';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { scheduleOnce } from '@ember/runloop';
import $ from 'jquery';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import moment from 'moment';

const validIpRegexp =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const ipDomainRegexp = /^\d+\.\d+\.\d+\.\d+/;

export default Component.extend(
  I18n,
  DomainNameProxy,
  createDataProxyMixin('zonePolicies'),
  createDataProxyMixin('dnsCheck'),
  createDataProxyMixin('dnsCheckConfiguration'),
  createDataProxyMixin('provider'), {
    classNames: ['cluster-dns'],

    onepanelServer: service(),
    clusterManager: service(),
    providerManager: service(),
    dnsManager: service(),
    guiUtils: service(),
    globalNotify: service(),

    i18nPrefix: 'components.clusterDns',

    /**
     * @virtual
     * @type {boolean}
     */
    getDnsCheckProxyOnStart: false,

    /**
     * @virtual optional
     * If true, all controls should be disabled
     */
    isWorking: false,

    /**
     * @virtual optional
     * Invoked with flag indicating last DNS check overall result (true when
     * all successful)
     */
    performCheckCalled: notImplementedIgnore,

    /**
     * @type {EmberObject}
     * Initialized on init
     */
    formValues: undefined,

    onepanelServiceType: reads('guiUtils.serviceType'),

    lastCheckMoment: undefined,

    lastCheckIsCurrent: undefined,

    newCheckIsNeededNotify: undefined,

    newIpAddress: '',

    dnsServersBusy: false,

    builtInDnsServerBusy: false,

    /**
     * Stores state of subdomainDelegation before auto turning off when
     * disabling built-in DNS server
     * @type {boolean}
     */
    subdomainDelegationPrev: undefined,

    builtInDnsServer: reads('dnsCheckConfiguration.builtInDnsServer'),

    providerOnezoneDomain: reads('provider.onezoneDomainName'),

    setLastCheckAsCurrent() {
      const newCheckIsNeededNotify = this.get('newCheckIsNeededNotify');
      if (newCheckIsNeededNotify) {
        newCheckIsNeededNotify.set('visible', false);
        safeExec(this, 'set', 'newCheckIsNeededNotify', undefined);
      }
    },

    setLastCheckAsObsolete() {
      if (!this.get('newCheckIsNeededNotify')) {
        const newCheckIsNeededNotify = this.get('globalNotify').info({
          html: `<strong>${this.t('dnsCheck.resultsObsoleteHead')}</strong><br>${this.t('dnsCheck.resultsObsoleteText')}`,
          closeAfter: null,
        });
        safeExec(this, 'set', 'newCheckIsNeededNotify', newCheckIsNeededNotify);
      }
    },

    /**
     * For Onezone: is Onezone subdomain delegation enabled (toggle),
     * for oneprovider: is Oneprovider using subdomain delegation.
     * @type {boolean|undefined}
     */
    subdomainDelegation: computed(
      'onepanelServiceType',
      'zonePolicies.subdomainDelegation',
      'provider.subdomainDelegation',
      function subdomainDelegation() {
        if (this.get('onepanelServiceType') === 'zone') {
          return this.get('zonePolicies.subdomainDelegation');
        } else {
          return this.get('provider.subdomainDelegation');
        }
      }
    ),

    performCheckEnabled: reads('dnsServersInputValid'),

    cannotUseBuiltInDnsServerReason: computed(
      'domain',
      function cannotUseBuiltInDnsServerReason() {
        const domain = this.get('domain');
        return domain && ipDomainRegexp.test(domain) && 'wrongDomain' || undefined;
      }
    ),

    cannotUseSubdomainDelegationReason: computed(
      'domain',
      'builtInDnsServer',
      function cannotUseSubdomainDelegationReason() {
        const {
          domain,
          builtInDnsServer,
        } = this.getProperties(
          'domain',
          'builtInDnsServer',
        );
        if (domain) {
          if (ipDomainRegexp.test(domain)) {
            return 'wrongDomain';
          } else if (!builtInDnsServer) {
            return 'noBuiltInDnsServer';
          }
        }
      }
    ),

    isIpDomain: computed('domain', function isIpDomain() {
      return ipDomainRegexp.test(this.get('domain'));
    }),

    stateInfo: computed(
      'onepanelServiceType',
      'isIpDomain',
      'subdomainDelegation',
      function stateInfo() {
        const {
          onepanelServiceType,
          isIpDomain,
          subdomainDelegation,
        } = this.getProperties(
          'onepanelServiceType',
          'isIpDomain',
          'subdomainDelegation',
        );
        if (onepanelServiceType === 'provider') {
          if (isIpDomain) {
            return 'providerIp';
          } else if (subdomainDelegation) {
            return 'providerSubdomainDelegation';
          } else {
            return 'providerNoSubdomainDelegation';
          }
        } else {
          if (isIpDomain) {
            return 'zoneIp';
          } else if (subdomainDelegation) {
            return 'zoneSubdomainDelegation';
          } else {
            return 'zoneNoSubdomainDelegation';
          }
        }
      }
    ),

    dnsServers: computed('dnsCheckConfiguration.dnsServers', function dnsServers() {
      const dnsServersConfig = this.get('dnsCheckConfiguration.dnsServers');
      return dnsServersConfig ? [...dnsServersConfig] : [];
    }),

    newIpAddressValid: computed('newIpAddress', function newIpAddressValid() {
      return this.validateIpAddress(this.get('newIpAddress'));
    }),

    dnsServersInputValid: computed('dnsServers.[]', function dnsServersInputValid() {
      return !_.isEmpty(this.get('dnsServers'));
    }),

    /**
     * Each object is a modified clone of Onepanel.DnsCheckResult with type added
     * corresponding to its type in Onepanel.DnsCheck.
     * Produces array of DnsCheckResults-like objects to render `check-items`
     * @type {Array<Object>}
     */
    checkResultItems: computed('dnsCheck', 'onepanelServiceType', function checkResultItems() {
      const {
        onepanelServiceType,
        dnsCheck,
      } = this.getProperties('onepanelServiceType', 'dnsCheck');
      if (dnsCheck) {
        const domain = get(dnsCheck, 'domain') ?
          Object.assign({ type: 'domain' }, _.cloneDeep(get(dnsCheck, 'domain'))) :
          undefined;
        const dnsZone = get(dnsCheck, 'dnsZone') ?
          Object.assign({ type: 'dnsZone' }, _.cloneDeep(get(dnsCheck, 'dnsZone'))) :
          undefined;
        const bothChecks = [dnsZone, domain].filter(c => c);
        if (onepanelServiceType === 'provider') {
          return [domain];
        } else {
          const builtInDnsServer = this.get('builtInDnsServer');
          const dnsZoneValid = (get(dnsCheck, 'dnsZone.summary') === 'ok');
          const domainValid = (get(dnsCheck, 'domain.summary') === 'ok');
          const hasInvalidRecords = _.includes(
            ['missing_records', 'bad_records'],
            get(dnsCheck, 'domain.summary')
          );

          if (
            onepanelServiceType === 'zone' &&
            builtInDnsServer &&
            domainValid &&
            dnsZoneValid
          ) {
            return [dnsZone];
          } else if (hasInvalidRecords) {
            set(domain, 'summary', 'delegation_invalid_records');
            return bothChecks;
          } else {
            return bothChecks;
          }
        }
      }
    }),

    allValid: computed('checkResultItems', function allValid() {
      const checkResultItems = this.get('checkResultItems');
      return checkResultItems.every(i => get(i, 'summary') === 'ok');
    }),

    validateIpAddress(ipAddress) {
      return !ipAddress || validIpRegexp.test(ipAddress);
    },

    init() {
      this._super(...arguments);
      if (!this.get('formValues')) {
        this.set('formValues', EmberObject.create({
          letsEncrypt: true,
        }));
      }
      this.updateDnsCheckConfigurationProxy();
      if (this.get('getDnsCheckProxyOnStart')) {
        (
          this.set('dnsCheckProxy', this.get('dnsManager.dnsCheckProxy')) ||
          this.getDnsCheckProxy({
            reload: false,
            fetchArgs: [{ forceCheck: false }],
          })
        )
        .then(dnsCheck => {
          safeExec(this, 'set', 'lastCheckMoment', moment(get(dnsCheck, 'timestamp')));
          this.get('performCheckCalled')(this.get('allValid'));
        });
      }
      if (this.get('onepanelServiceType') === 'zone') {
        this.updateZonePoliciesProxy();
      } else {
        this.updateProviderProxy();
      }
      // enable observers
      this.get('lastCheckIsCurrent');
    },

    willDestroyElement() {
      try {
        safeExec(this, 'setLastCheckAsCurrent');
      } finally {
        this._super(...arguments);
      }
    },

    fetchZonePolicies() {
      return this.get('onepanelServer').request('onezone', 'getZonePolicies')
        .then(({ data }) => data);
    },

    fetchDnsCheckConfiguration() {
      return this.get('onepanelServer').request('onepanel', 'getDnsCheckConfiguration')
        .then(({ data }) => data);
    },

    fetchDnsCheck(...args) {
      return this.get('dnsManager').getDnsCheckProxy({
        reload: true,
        fetchArgs: args,
      });
    },

    fetchProvider() {
      return this.get('providerManager').getProviderDetails();
    },

    /**
     * Partially modify DnsCheckConfiguration
     * @returns {Promise}
     */
    modifyDnsCheckConfiguration({ dnsServers, builtInDnsServer }) {
      const config = {};
      const modifyBuiltInDnsServer = (builtInDnsServer !== undefined);
      if (dnsServers) {
        safeExec(this, 'set', 'dnsServersBusy', true);
        config.dnsServers = dnsServers;
      }
      if (modifyBuiltInDnsServer) {
        safeExec(this, 'set', 'builtInDnsServerBusy', true);
        config.builtInDnsServer = builtInDnsServer;
      }

      return this.get('onepanelServer')
        .request('onepanel', 'modifyDnsCheckConfiguration', config)
        .finally(() => {
          if (dnsServers) {
            safeExec(this, 'set', 'dnsServersBusy', false);
          }
          if (modifyBuiltInDnsServer) {
            safeExec(this, 'set', 'builtInDnsServerBusy', false);
          }
        });
    },

    modifyZonePolicies({ subdomainDelegation }) {
      const config = {};
      if (subdomainDelegation !== undefined) {
        config.subdomainDelegation = subdomainDelegation;
      }

      return this.get('onepanelServer')
        .request('onezone', 'modifyZonePolicies', config);
    },

    actions: {
      dnsServersInitialized(dnsServers) {
        this.set('dnsServers', dnsServers);
      },
      changeBuiltInDnsServer(enabled) {
        return this.modifyDnsCheckConfiguration({ builtInDnsServer: enabled })
          .then(() => this.updateDnsCheckConfigurationProxy({ replace: true }))
          .then(() => {
            if (enabled === false) {
              safeExec(
                this,
                'set',
                'subdomainDelegationPrev',
                this.get('subdomainDelegation')
              );
              return this.modifyZonePolicies({ subdomainDelegation: false });
            } else if (this.get('subdomainDelegationPrev') !== undefined) {
              const subdomainDelegation = this.get('subdomainDelegationPrev');
              safeExec(this, 'set', 'subdomainDelegationPrev', undefined);
              return this.modifyZonePolicies({ subdomainDelegation });
            }
          })
          .then(() => this.updateZonePoliciesProxy({ replace: true }))
          .then(() => safeExec(this, 'setLastCheckAsObsolete'))
          .catch(error => {
            this.get('globalNotify').backendError(
              this.t('onezoneBuiltInServer.togglingBuiltInDnsServer'),
              error,
            );
          });
      },
      changeSubdomainDelegation(enabled) {
        return this.modifyZonePolicies({ subdomainDelegation: enabled })
          .then(() => this.updateZonePoliciesProxy({ replace: true }))
          .catch(error => {
            this.get('globalNotify').backendError(
              this.t('subdomainDelegation.togglingSubdomainDelegation'),
              error,
            );
          })
          .then(() => safeExec(this, 'setLastCheckAsObsolete'));
      },
      performDnsCheck() {
        const promise = this.updateDnsCheckProxy({
          replace: false,
          fetchArgs: [{ forceCheck: true }],
        });
        promise
          .then(dnsCheck => {
            safeExec(this, 'set', 'lastCheckMoment', moment(get(dnsCheck, 'timestamp')));
            this.get('performCheckCalled')(this.get('allValid'));
          })
          .then(() => {
            scheduleOnce('afterRender',
              () => $('.col-content').scrollTo(this.$('.row-dns-check-results'), 250)
            );
            safeExec(this, 'setLastCheckAsCurrent');
          });
        return promise;
      },
      dnsServersChanged(dnsServersUpdate) {
        const newIpAddress = this.get('newIpAddress');
        const dnsServers = this.get('dnsServers');
        const isAddingNew =
          _.includes(_.difference(dnsServersUpdate, dnsServers), newIpAddress);
        if (!isAddingNew || this.get('newIpAddressValid')) {
          this.setProperties({
            newIpAddress: '',
            clusterDnsInputBusy: true,
          });
          this.modifyDnsCheckConfiguration({ dnsServers: dnsServersUpdate })
            .then(() => {
              safeExec(this, 'setProperties', {
                dnsServers: dnsServersUpdate,
                newIpAddress: '',
              });
              safeExec(this, 'setLastCheckAsObsolete');
            })
            .catch(error => {
              this.get('globalNotify').backendError(
                this.t('dnsCheck.modifyingDnsServers'),
                error,
              );
              // rollback changes
              safeExec(this, 'setProperties', {
                dnsServers: [...dnsServers],
                newIpAddress,
              });
            })
            .finally(() => safeExec(this, 'set', 'clusterDnsInputBusy', false));
        } else {
          safeExec(this, 'setProperties', {
            dnsServers: _.without(dnsServersUpdate, newIpAddress),
            newIpAddress,
          });
        }
      },
    },
  });
