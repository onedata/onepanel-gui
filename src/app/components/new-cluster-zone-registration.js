/**
 * A container for register provider form in installation steps
 *
 * @module components/new-cluster-zone-registration
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { not } from '@ember/object/computed';
import { Promise, reject } from 'rsvp';
import Component from '@ember/component';
import Onepanel from 'onepanel';
import stripObject from 'onedata-gui-common/utils/strip-object';
import extractNestedError from 'onepanel-gui/utils/extract-nested-error';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { get } from '@ember/object';
import trimToken from 'onedata-gui-common/utils/trim-token';
import computedPipe from 'onedata-gui-common/utils/ember/computed-pipe';

const {
  ProviderRegisterRequest,
} = Onepanel;

const I18N_PREFIX = 'components.newClusterZoneRegistration.';

export default Component.extend(I18n, {
  classNames: ['new-cluster-zone-registration'],

  globalNotify: service(),
  onepanelServer: service(),
  i18n: service(),
  clusterModelManager: service(),
  alertService: service('alert'),
  guiUtils: service(),

  i18nPrefix: 'components.newClusterZoneRegistration',

  /**
   * @virtual
   * @type {() => void}
   */
  nextStep: undefined,

  /**
   * @type {ComputedProperty<boolean>}
   */
  proceedTokenDisabled: not('trimmedToken'),

  /**
   * Subdomains that are reserved and cannot be used
   * @type {Array<string>}
   */
  _excludedSubdomains: Object.freeze([]),

  /**
   * One of: token, form, notCompatible, offline
   * @type {string}
   */
  mode: 'token',

  /**
   * If true, shows additional tutorial for getting the token
   * @type {boolean}
   */
  showTokenHelp: false,

  /**
   * Onezone token pasted by user
   * @type {string}
   */
  token: '',

  /**
   * Is set by `handleProceedToken` after successful token submission
   * @type {Onepanel.OnezoneInfo}
   */
  onezoneInfo: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  trimmedToken: computedPipe('token', trimToken),

  /**
   * @param {Ember.Object} providerData data from provider registration form
   * @returns {Onepanel.ProviderRegisterRequest}
   */
  createProviderRegisterRequest(providerData) {
    const {
      token,
      name,
      onezoneDomainName,
      subdomainDelegation,
      subdomain,
      domain,
      geoLongitude,
      geoLatitude,
      adminEmail,
    } = providerData.getProperties(
      'token',
      'name',
      'onezoneDomainName',
      'subdomainDelegation',
      'subdomain',
      'domain',
      'geoLongitude',
      'geoLatitude',
      'adminEmail',
    );

    const reqProto = stripObject({
      token,
      name,
      onezoneDomainName,
      subdomainDelegation,
      subdomain,
      domain,
      adminEmail,
      geoLongitude: Number.parseFloat(geoLongitude),
      geoLatitude: Number.parseFloat(geoLatitude),
    }, [undefined, null, NaN, '']);

    const req = ProviderRegisterRequest.constructFromObject(reqProto);

    return req;
  },

  /**
   * Use API to register provider
   * @param {Ember.Object} providerData
   * @returns {Promise} resolves when provider was registered; otherwise rejects
   */
  _submit(providerData) {
    const submitting = new Promise((resolve, reject) => {
      const onepanelServer = this.get('onepanelServer');
      const providerRegisterRequest = this.createProviderRegisterRequest(
        providerData);
      const addingProvider =
        onepanelServer.request('OneproviderIdentityApi', 'addProvider',
          providerRegisterRequest);

      addingProvider.then(resolve, reject);
    });

    return submitting;
  },

  handleProceedToken() {
    return this.get('onepanelServer')
      .request('OneproviderIdentityApi', 'getOnezoneInfo', {
        token: this.get('trimmedToken'),
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('gettingOnezoneInfo'), error);
        throw error;
      })
      .then(({ data: onezoneInfo }) => {
        const {
          i18n,
          alertService,
          guiUtils,
        } = this.getProperties('i18n', 'alertService', 'guiUtils');
        if (get(onezoneInfo, 'compatible') === false) {
          alertService.error(null, {
            componentName: 'alerts/register-onezone-not-compatible',
            header: i18n.t(
              'components.alerts.registerOnezoneNotCompatible.header'
            ),
            domain: get(onezoneInfo, 'domain'),
            oneproviderVersion: get(
              guiUtils,
              'softwareVersionDetails.serviceVersion'
            ),
            onezoneVersion: get(onezoneInfo, 'version'),
          });
        } else if (get(onezoneInfo, 'online') === false) {
          alertService.error(null, {
            componentName: 'alerts/register-onezone-offline',
            header: i18n.t(
              'components.alerts.registerOnezoneOffline.header'
            ),
            domain: get(onezoneInfo, 'domain'),
          });
        } else {
          safeExec(this, 'setProperties', {
            onezoneInfo,
            mode: 'form',
          });
        }
      });
  },

  actions: {
    /**
     * Start registering provider
     * @param {Ember.Object} providerData
     * @returns {Promise} ``_submit`` promise
     */
    submit(providerData) {
      const {
        globalNotify,
        _excludedSubdomains,
        i18n,
        nextStep,
      } = this.getProperties('globalNotify', '_excludedSubdomains', 'i18n', 'nextStep');
      const submitting = this._submit(providerData);
      submitting.then(() => {
        globalNotify.info(i18n.t(I18N_PREFIX + 'providerRegisteredSuccessfully'));
        if (nextStep) {
          nextStep();
        }
        this.get('clusterModelManager').updateCurrentClusterProxy();
      });
      submitting.catch(errorResponse => {
        const nestedError = extractNestedError(
          get(errorResponse, 'response.body.error')
        );
        const isSubdomainReservedError = nestedError &&
          get(nestedError, 'id') === 'badValueIdentifierOccupied' &&
          get(nestedError, 'details.key') === 'subdomain';
        if (isSubdomainReservedError) {
          this.set(
            '_excludedSubdomains',
            _excludedSubdomains.concat(providerData.subdomain)
          );
        }
        this.get('globalNotify').backendError(
          'provider registration',
          errorResponse
        );
      });
      return submitting;
    },

    proceedToken() {
      if (!this.get('proceedTokenDisabled')) {
        return this.handleProceedToken();
      } else {
        return reject();
      }
    },

    back() {
      this.setProperties({
        mode: 'token',
        onezoneInfo: undefined,
      });
    },
  },
});
