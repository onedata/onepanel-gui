/**
 * A container for register provider form in installation steps
 *
 * @module components/new-cluster-zone-registration
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { not } from '@ember/object/computed';
import { Promise, reject } from 'rsvp';
import Component from '@ember/component';
import Onepanel from 'npm:onepanel';
import stripObject from 'onedata-gui-common/utils/strip-object';
import { invokeAction } from 'ember-invoke-action';
import getSubdomainReservedErrorMsg from 'onepanel-gui/utils/get-subdomain-reserved-error-msg';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { get } from '@ember/object';

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
   * @type {ComputedProperty<boolean>}
   */
  proceedTokenDisabled: not('token'),

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
   * @param {Ember.Object} providerData data from provider registration form
   * @returns {Onepanel.ProviderRegisterRequest}
   */
  createProviderRegisterRequest(providerData) {
    let {
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

    let reqProto = stripObject({
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

    let req = ProviderRegisterRequest.constructFromObject(reqProto);

    return req;
  },

  /**
   * Use API to register provider
   * @param {Ember.Object} providerData 
   * @returns {Promise} resolves when provider was registered; otherwise rejects
   */
  _submit(providerData) {
    let submitting = new Promise((resolve, reject) => {
      let onepanelServer = this.get('onepanelServer');
      let providerRegisterRequest = this.createProviderRegisterRequest(
        providerData);
      let addingProvider =
        onepanelServer.request('oneprovider', 'addProvider',
          providerRegisterRequest);

      addingProvider.then(resolve, reject);
    });

    return submitting;
  },

  handleProceedToken() {
    return this.get('onepanelServer').request('oneprovider', 'getOnezoneInfo', {
        token: this.get('token').trim(),
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
            oneproviderVersion: get(guiUtils, 'guiVersion'),
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
      let {
        globalNotify,
        _excludedSubdomains,
        i18n,
      } = this.getProperties('globalNotify', '_excludedSubdomains', 'i18n');
      let submitting = this._submit(providerData);
      submitting.then(() => {
        globalNotify.info(i18n.t(I18N_PREFIX + 'providerRegisteredSuccessfully'));
        invokeAction(this, 'nextStep');
        this.get('clusterModelManager').updateCurrentClusterProxy();
      });
      submitting.catch(error => {
        const subdomainReservedMsg = getSubdomainReservedErrorMsg(error);
        if (subdomainReservedMsg) {
          this.set('_excludedSubdomains', _excludedSubdomains.concat(
            providerData.subdomain));
          error = { error: error.error, message: subdomainReservedMsg };
        }
        this.get('globalNotify').backendError(
          'provider registration',
          error
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
