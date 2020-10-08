/**
 * View for configuring built-in DNS server, subdomain delegation and perform
 * DNS checks both for deployment and as cluster aspect.
 * 
 * @module components/cluster-dns
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import EmberObject, { computed, observer, get, set } from '@ember/object';
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
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';

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
    deploymentManager: service(),
    providerManager: service(),
    dnsManager: service(),
    guiUtils: service(),
    globalNotify: service(),
    i18n: service(),

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
     * @virtual optional
     * Invoked withoud params when settings changes (check is not current anymore)
     */
    settingsChanged: notImplementedIgnore,

    /**
     * @virtual optional
     * Invoked with isIpDomain value when isIpDomain changed.
     * @type {function}
     * @param {boolean} isIpChanged
     */
    isIpDomainChanged: notImplementedIgnore,

    /**
     * @type {EmberObject}
     * Initialized on init
     */
    formValues: undefined,

    /**
     * @type {moment}
     */
    lastCheckMoment: undefined,

    /**
     * Instance of ember-notify single message
     * @type {EmberObject}
     */
    newCheckIsNeededNotify: undefined,

    /**
     * Value of dnsServers new entry input
     * @type {string}
     */
    newIpAddress: '',

    /**
     * If true, dnsServers tokens input should be displayed as working
     * @type {boolean}
     */
    dnsServersBusy: false,

    /**
     * If true, build in DNS server toggle should be displayed as working
     * @type {boolean}
     */
    builtInDnsServerBusy: false,

    /**
     * Stores state of subdomainDelegation before auto turning off when
     * disabling built-in DNS server
     * @type {boolean}
     */
    subdomainDelegationPrev: undefined,

    /**
     * Contains old value of dnsServers to preserve dns servers input state
     * after change to autodetect mode.
     * @type {Array<string>}
     */
    dnsServersPrev: Object.freeze([]),

    /**
     * @type {string}
     */
    dnsCheckMode: 'autodetect',

    /**
     * @type {Ember.ComputedProperty<string>}
     */
    onepanelServiceType: reads('guiUtils.serviceType'),

    /**
     * If true, built in DNS server toggle is in enabled state
     * @type {Ember.ComputedProperty<boolean>}
     */
    builtInDnsServer: reads('dnsCheckConfiguration.builtInDnsServer'),

    /**
     * In Oneprovider service, contains domain name of Onezone where
     * the provider is registered
     * @type {Ember.ComputedProperty<string>}
     */
    providerOnezoneDomain: reads('provider.onezoneDomainName'),

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
        if (this.get('onepanelServiceType') === 'onezone') {
          return this.get('zonePolicies.subdomainDelegation');
        } else {
          return this.get('provider.subdomainDelegation');
        }
      }
    ),

    /**
     * If true, the perform check button should be enabled
     * @type {Ember.ComputedProperty<boolean>}
     */
    performCheckEnabled: reads('dnsServersInputValid'),

    /**
     * If true, the edited DNS server IP address is considered valid IP address,
     * so it can be added to the list
     * @type {Ember.ComputedProperty<boolean>}
     */
    newIpAddressValid: computedPipe('newIpAddress', 'validateIpAddress'),

    /**
     * If true, the service domain (Onezone or Oneprovider) is an IP address,
     * so the check function should be disabled
     * @type {Ember.ComputedProperty<boolean>}
     */
    isIpDomain: computedPipe('domain', RegExp.prototype.test.bind(ipDomainRegexp)),

    /**
     * The reason why the built-in DNS server cannot be set to enabled.
     * Currently only: `wrongDomain`
     * @type {Ember.ComputedProperty<string|undefined>}
     */
    cannotUseBuiltInDnsServerReason: computed(
      'domain',
      function cannotUseBuiltInDnsServerReason() {
        const domain = this.get('domain');
        return domain && ipDomainRegexp.test(domain) && 'wrongDomain' || undefined;
      }
    ),

    /**
     * The reason why the Subdomain Delegation feature cannot be set to enabled.
     * Values: `wrongDomain`, `noBuiltInDnsServer`
     * @type {Ember.ComputedProperty<string|undefined>}
     */
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

    /**
     * Key of text in DNS check section.
     * @type {Ember.ComputedProperty<string>}
     */
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
        if (onepanelServiceType === 'oneprovider') {
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

    /**
     * @type {Ember.ComputedProperty<Array<string>>}
     */
    dnsServers: computed('dnsCheckConfiguration.dnsServers', function dnsServers() {
      const dnsServersConfig = this.get('dnsCheckConfiguration.dnsServers');
      return dnsServersConfig ? [...dnsServersConfig] : [];
    }),

    /**
     * True if the list in tokenized input of DNS servers is valid.
     * @type {Ember.ComputedProperty<boolean>}
     */
    dnsServersInputValid: computed(
      'dnsServers.[]',
      'dnsCheckMode',
      function dnsServersInputValid() {
        return !_.isEmpty(this.get('dnsServers')) ||
          this.get('dnsCheckMode') === 'autodetect';
      }
    ),

    /**
     * Each object is a modified clone of Onepanel.DnsCheckResult with type added
     * corresponding to its type in Onepanel.DnsCheck.
     * Produces array of DnsCheckResults-like objects to render `check-items`
     * @type {Array<Object>}
     */
    checkResultItems: computed('dnsCheck', 'onepanelServiceType',
      function checkResultItems() {
        const {
          onepanelServiceType,
          dnsCheck,
        } = this.getProperties('onepanelServiceType', 'dnsCheck');
        if (dnsCheck) {
          const domain = get(dnsCheck, 'domain') ?
            Object.assign({ type: 'domain' }, _.cloneDeep(get(dnsCheck, 'domain'))) :
            undefined;
          if (onepanelServiceType === 'oneprovider') {
            return [domain];
          } else {
            const dnsZone = get(dnsCheck, 'dnsZone') ?
              Object.assign({
                  type: 'dnsZone',
                },
                _.cloneDeep(get(dnsCheck, 'dnsZone'))
              ) : undefined;
            const bothChecks = [dnsZone, domain].filter(c => c);
            const builtInDnsServer = this.get('builtInDnsServer');
            const dnsZoneValid = (get(dnsCheck, 'dnsZone.summary') === 'ok');
            const domainValid = (get(dnsCheck, 'domain.summary') === 'ok');
            const hasInvalidRecords = _.includes(
              ['missing_records', 'bad_records'],
              get(dnsCheck, 'domain.summary')
            );

            if (
              onepanelServiceType === 'onezone' &&
              builtInDnsServer &&
              domainValid &&
              dnsZoneValid
            ) {
              return [dnsZone];
            } else {
              if (hasInvalidRecords) {
                set(domain, 'summary', 'delegation_invalid_records');
              }
              return bothChecks;
            }
          }
        }
      }),

    /**
     * True if all essential DNS checks for user are valid
     * @type {Ember.ComputedProperty<boolean>}
     */
    allValid: computed('checkResultItems', function allValid() {
      const checkResultItems = this.get('checkResultItems');
      return checkResultItems.every(i => get(i, 'summary') === 'ok');
    }),

    /**
     * @type {Ember.ComputedProperty<Array<Object>>}
     */
    dnsCheckModes: computed(function dnsCheckModes() {
      return [{
        label: this.t('dnsCheckAutodetect'),
        value: 'autodetect',
      }, {
        label: this.t('dnsCheckManual'),
        value: 'manual',
      }];
    }),

    isIpDomainObserver: observer('isIpDomain', function isIpDomainObserver() {
      const {
        isIpDomainChanged,
        isIpDomain,
      } = this.getProperties('isIpDomainChanged', 'isIpDomain');
      isIpDomainChanged(isIpDomain);
    }),

    init() {
      this._super(...arguments);
      if (!this.get('formValues')) {
        this.set('formValues', EmberObject.create({
          letsEncrypt: true,
        }));
      }
      this.updateDnsCheckConfigurationProxy()
        .then(({ dnsServers }) => safeExec(this, () => {
          this.set('dnsCheckMode', get(dnsServers, 'length') ? 'manual' :
            'autodetect');
        }));
      this.updateDomainProxy();
      if (this.get('getDnsCheckProxyOnStart')) {
        (
          this.set('dnsCheckProxy', this.get('dnsManager.dnsCheckProxy')) ||
          this.getDnsCheckProxy({
            reload: false,
            fetchArgs: [{ forceCheck: false }],
          })
        )
        .then(dnsCheck => {
          safeExec(
            this,
            'set',
            'lastCheckMoment',
            moment(get(dnsCheck, 'timestamp'))
          );
          this.get('performCheckCalled')(this.get('allValid'));
        });
      }
      if (this.get('onepanelServiceType') === 'onezone') {
        this.updateZonePoliciesProxy();
      } else {
        this.updateProviderProxy();
      }
      // enable isIpDomainObserver 
      this.get('isIpDomain');
    },

    willDestroyElement() {
      try {
        this.setLastCheckAsCurrent();
      } finally {
        this._super(...arguments);
      }
    },

    setLastCheckAsCurrent() {
      const newCheckIsNeededNotify = this.get('newCheckIsNeededNotify');
      if (newCheckIsNeededNotify) {
        newCheckIsNeededNotify.set('visible', false);
        this.set('newCheckIsNeededNotify', undefined);
      }
    },

    setLastCheckAsObsolete() {
      if (!this.get('newCheckIsNeededNotify')) {
        const newCheckIsNeededNotify = this.get('globalNotify').info({
          html: this.t('dnsCheck.resultsObsoleteText'),
          oneTitle: this.t('dnsCheck.resultsObsoleteHead'),
          oneIcon: 'sign-warning',
          closeAfter: null,
        });
        this.set('newCheckIsNeededNotify', newCheckIsNeededNotify);
        this.get('settingsChanged')();
      }
    },

    validateIpAddress(ipAddress) {
      return !ipAddress || validIpRegexp.test(ipAddress);
    },

    fetchZonePolicies() {
      return this.get('onepanelServer')
        .request('ServiceConfigurationApi', 'getZonePolicies')
        .then(({ data }) => data);
    },

    fetchDnsCheckConfiguration() {
      return this.get('onepanelServer')
        .request('DNSAndWebCertificatesApi', 'getDnsCheckConfiguration')
        .then(({ data }) => data);
    },

    fetchDnsCheck(...args) {
      return this.get('dnsManager').getDnsCheckProxy({
        reload: true,
        fetchArgs: args,
      });
    },

    fetchProvider() {
      return this.get('providerManager').getProviderDetailsProxy();
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
        .request('DNSAndWebCertificatesApi', 'modifyDnsCheckConfiguration', config)
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
        .request('ServiceConfigurationApi', 'modifyZonePolicies', config);
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
            safeExec(
              this,
              'set',
              'lastCheckMoment',
              moment(get(dnsCheck, 'timestamp'))
            );
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
        const {
          newIpAddress,
          dnsServers,
        } = this.getProperties('newIpAddress', 'dnsServers');
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
      dnsCheckModeChanged(value) {
        this.set('dnsCheckMode', value);
        if (value === 'autodetect') {
          this.set('dnsServersPrev', this.get('dnsServers'));
          this.send('dnsServersChanged', []);
        } else {
          const dnsServersPrev = this.get('dnsServersPrev');
          if (get(dnsServersPrev, 'length')) {
            this.send('dnsServersChanged', this.get('dnsServersPrev'));
          }
        }
      },
    },
  });
